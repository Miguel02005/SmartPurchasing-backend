import {
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ProductService } from '../../src/modules/product/product.service';
import { ProductVendorEntity } from '../../src/modules/product/entities/product.entity';

describe('ProductService', () => {
  let service: ProductService;
  let productRepository: any;

  const baseDto = {
    productId: 1,
    businessEntityId: 2,
    averageLeadTime: 14,
    standardPrice: 120,
    lastReceiptCost: 90,
    lastReceiptDate: '2024-01-15T00:00:00.000Z',
    minOrderQty: 10,
    maxOrderQty: 50,
    onOrderQty: 5,
    unitMeasureCode: 'EA',
  };

  beforeEach(() => {
    productRepository = {
      find: jest.fn(),
      count: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn(),
    };

    service = new ProductService(productRepository);
  });

  it('should throw ConflictException when trying to create an existing vendor-product relation', async () => {
    productRepository.findOne.mockResolvedValue({
      productId: 1,
      businessEntityId: 2,
    });

    await expect(service.create(baseDto as any)).rejects.toThrow(
      ConflictException,
    );
    await expect(service.create(baseDto as any)).rejects.toThrow(
      'Product with ID 1 already exists for vendor 2',
    );
  });

  it('should create a product relation when it does not exist yet', async () => {
    productRepository.findOne.mockResolvedValue(null);
    const created = { ...baseDto, modifiedDate: new Date() };
    productRepository.create.mockReturnValue(created);
    productRepository.save.mockResolvedValue(created);

    const result = await service.create(baseDto as any);

    expect(productRepository.create).toHaveBeenCalledWith(baseDto);
    expect(productRepository.save).toHaveBeenCalledWith(created);
    expect(result).toEqual(created);
  });

  it('should return true when the product exists for a vendor', async () => {
    productRepository.count.mockResolvedValue(1);

    await expect(service.existsForVendor(1, 2)).resolves.toBe(true);
    expect(productRepository.count).toHaveBeenCalledWith({
      where: { productId: 1, businessEntityId: 2 },
    });
  });

  it('should convert lastReceiptDate to Date before updating', async () => {
    const current = {
      ...baseDto,
      lastReceiptDate: new Date('2023-01-01'),
    } as ProductVendorEntity;
    productRepository.findOne.mockResolvedValue(current);
    productRepository.merge.mockImplementation((entity: any, update: any) => {
      Object.assign(entity, update);
    });
    productRepository.save.mockImplementation(async (entity: any) => entity);

    const result = await service.update(1, 2, {
      standardPrice: 150,
      lastReceiptDate: '2024-02-20T00:00:00.000Z',
    });

    expect(productRepository.merge).toHaveBeenCalledWith(
      current,
      expect.objectContaining({
        standardPrice: 150,
        lastReceiptDate: expect.any(Date),
      }),
    );
    expect(result.lastReceiptDate).toBeInstanceOf(Date);
    expect(result.standardPrice).toBe(150);
  });

  it('should remove a product relation if it exists', async () => {
    const current = { ...baseDto } as unknown as ProductVendorEntity;
    productRepository.findOne.mockResolvedValue(current);

    await service.remove(1, 2);

    expect(productRepository.remove).toHaveBeenCalledWith(current);
  });

  describe('findByVendor', () => {
    const buildRow = (
      productId: number,
      product: Record<string, unknown>,
    ): ProductVendorEntity =>
      ({
        productId,
        businessEntityId: 1492,
        averageLeadTime: 15,
        standardPrice: 45.12,
        lastReceiptCost: 43.99,
        lastReceiptDate: new Date('2024-01-15T00:00:00.000Z'),
        minOrderQty: 1,
        maxOrderQty: 100,
        onOrderQty: 0,
        unitMeasureCode: 'EA',
        modifiedDate: new Date('2024-02-01T00:00:00.000Z'),
        product: { productId, ...product },
      }) as unknown as ProductVendorEntity;

    it('should ask the repository for the product relation', async () => {
      productRepository.find.mockResolvedValue([]);

      await service.findByVendor(1492);

      expect(productRepository.find).toHaveBeenCalledWith({
        where: { businessEntityId: 1492 },
        relations: { product: true },
      });
    });

    it('should map the catalog data of each product into the response', async () => {
      productRepository.find.mockResolvedValue([
        buildRow(1, {
          name: 'Adjustable Race',
          productNumber: 'AR-9981',
          color: 'Black',
        }),
        buildRow(707, {
          name: 'Chainring',
          productNumber: 'CH-0234',
          color: null,
        }),
      ]);

      const result = await service.findByVendor(1492);

      expect(result).toHaveLength(2);
      expect(result[0].product).toEqual({
        productId: 1,
        name: 'Adjustable Race',
        productNumber: 'AR-9981',
        color: 'Black',
      });
      expect(result[1].product).toEqual({
        productId: 707,
        name: 'Chainring',
        productNumber: 'CH-0234',
        color: null,
      });
    });

    it('should keep every product mapped to its own row', async () => {
      const names = ['Adjustable Race', 'Chainring', 'LL Mountain Seat'];
      productRepository.find.mockResolvedValue(
        names.map((name, index) =>
          buildRow(index + 1, {
            name,
            productNumber: `PN-${index + 1}`,
            color: 'Red',
          }),
        ),
      );

      const result = await service.findByVendor(1492);

      expect(result.map((row) => row.product.name)).toEqual(names);
      expect(result.map((row) => row.productId)).toEqual([1, 2, 3]);
      result.forEach((row, index) => {
        expect(row.product.productNumber).toBe(`PN-${index + 1}`);
      });
    });

    it('should throw when a vendor-product row has no catalog product', async () => {
      const orphan = buildRow(1, {});
      (orphan as any).product = null;
      productRepository.find.mockResolvedValue([orphan]);

      await expect(service.findByVendor(1492)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.findByVendor(1492)).rejects.toThrow(
        'no tiene producto asociado en Production.Product',
      );
    });

    it('should return an empty list when the vendor has no products', async () => {
      productRepository.find.mockResolvedValue([]);

      await expect(service.findByVendor(1492)).resolves.toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should scope the lookup to the vendor and join the product', async () => {
      productRepository.findOne.mockResolvedValue({
        productId: 707,
        businessEntityId: 1492,
        averageLeadTime: 2,
        standardPrice: 34.99,
        lastReceiptCost: 13.0863,
        lastReceiptDate: new Date('2011-08-01'),
        minOrderQty: 1,
        maxOrderQty: 100,
        onOrderQty: 0,
        unitMeasureCode: 'EA',
        modifiedDate: new Date('2011-05-31'),
        product: {
          productId: 707,
          name: 'Sport-100 Helmet, Red',
          productNumber: 'HL-U509-R',
          color: 'Red',
        },
      });

      const result = await service.findOne(707, 1492);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { productId: 707, businessEntityId: 1492 },
        relations: { product: true },
      });
      expect(result.product).toEqual({
        productId: 707,
        name: 'Sport-100 Helmet, Red',
        productNumber: 'HL-U509-R',
        color: 'Red',
      });
    });

    it('should throw NotFoundException when the productId does not match', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999999, 1492)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne(999999, 1492)).rejects.toThrow(
        'No existe relación producto-vendor con productId=999999 y businessEntityId=1492',
      );
    });

    it('should not find a product that belongs to another vendor', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(707, 1)).rejects.toThrow(NotFoundException);
      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { productId: 707, businessEntityId: 1 },
        relations: { product: true },
      });
    });
  });
});
