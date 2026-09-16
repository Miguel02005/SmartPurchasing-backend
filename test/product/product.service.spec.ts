import { ConflictException, NotFoundException } from '@nestjs/common';
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
});
