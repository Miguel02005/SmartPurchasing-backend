import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { PurchaseOrderService } from '../../src/modules/purchase-order/purchase-order.service';
import { PurchaseOrderHeaderEntity } from '../../src/modules/purchase-order/entities/purchase-order-header.entity';
import { PurchaseOrderDetailEntity } from '../../src/modules/purchase-order/entities/purchase-order-detail.entity';

describe('PurchaseOrderService', () => {
  let service: PurchaseOrderService;
  let purchaseOrderRepository: any;
  let purchaseOrderDetailRepository: any;
  let dataSource: any;
  let shipMethodService: { existsById: jest.Mock };
  let manager: any;

  beforeEach(() => {
    purchaseOrderRepository = {
      find: jest.fn(),
      count: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      merge: jest.fn(),
      save: jest.fn(),
    };

    purchaseOrderDetailRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
    };

    manager = {
      save: jest.fn(),
      create: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      find: jest.fn(),
      update: jest.fn(),
      merge: jest.fn(),
    };

    dataSource = {
      transaction: jest.fn(),
    };

    shipMethodService = {
      existsById: jest.fn(),
    };

    service = new PurchaseOrderService(
      purchaseOrderRepository,
      purchaseOrderDetailRepository,
      dataSource as DataSource,
      shipMethodService as any,
    );
  });

  it('should return purchase orders for a vendor ordered by date', async () => {
    const orders = [{ purchaseOrderId: 1 }];
    purchaseOrderRepository.find.mockResolvedValue(orders);

    const result = await service.findByVendor(7);

    expect(purchaseOrderRepository.find).toHaveBeenCalledWith({
      where: { businessEntityId: 7 },
      relations: { details: true, shipMethod: true },
      order: { orderDate: 'DESC' },
    });
    expect(result).toBe(orders);
  });

  it('should return true when the vendor has a purchase order', async () => {
    purchaseOrderRepository.count.mockResolvedValue(1);

    await expect(service.existsForVendor(55, 7)).resolves.toBe(true);
    expect(purchaseOrderRepository.count).toHaveBeenCalledWith({
      where: { purchaseOrderId: 55, businessEntityId: 7 },
    });
  });

  it('should create a purchase order with subtotal and details inside a transaction', async () => {
    shipMethodService.existsById.mockResolvedValue(true);

    const dto = {
      shipMethodId: 3,
      orderDate: '2026-09-01',
      shipDate: '2026-09-05',
      details: [
        { productId: 10, orderQty: 2, unitPrice: 25.5, dueDate: '2026-09-08' },
      ],
    };

    const savedOrder = {
      purchaseOrderId: 101,
      businessEntityId: 7,
      shipMethodId: 3,
      employeeId: 1,
      orderDate: new Date('2026-09-01'),
      shipDate: new Date('2026-09-05'),
      subTotal: 51,
      details: [],
    };

    const savedDetail = {
      purchaseOrderDetailId: 1,
      purchaseOrderId: 101,
      productId: 10,
      orderQty: 2,
      unitPrice: 25.5,
      dueDate: new Date('2026-09-08'),
      receivedQty: 0,
      rejectedQty: 0,
    };

    purchaseOrderRepository.create.mockReturnValue(savedOrder);
    dataSource.transaction.mockImplementation(async (callback) => {
      return callback(manager);
    });
    manager.save.mockImplementation(async (entity) => {
      if (Array.isArray(entity)) {
        return entity.map((item) => ({ ...item, purchaseOrderDetailId: 1 }));
      }
      return savedOrder;
    });
    manager.create.mockReturnValue(savedDetail);

    const result = await service.create(dto as any, 7);

    expect(shipMethodService.existsById).toHaveBeenCalledWith(3);
    expect(purchaseOrderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        businessEntityId: 7,
        employeeId: 1,
        shipMethod: { shipMethodId: 3 },
        orderDate: expect.any(Date),
        shipDate: expect.any(Date),
        subTotal: 51,
      }),
    );
    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(result).toEqual(savedOrder);
  });

  it('should reject invalid shipMethodId during creation', async () => {
    shipMethodService.existsById.mockResolvedValue(false);

    await expect(
      service.create(
        {
          shipMethodId: 999,
          orderDate: '2026-09-01',
          details: [{ productId: 1, orderQty: 2, unitPrice: 10 }],
        } as any,
        7,
      ),
    ).rejects.toThrow(BadRequestException);
    await expect(
      service.create(
        {
          shipMethodId: 999,
          orderDate: '2026-09-01',
          details: [{ productId: 1, orderQty: 2, unitPrice: 10 }],
        } as any,
        7,
      ),
    ).rejects.toThrow('El método de envío con ID 999 no es válido');
  });

  it('should update the order and convert date strings to Date objects', async () => {
    const current = {
      purchaseOrderId: 8,
      businessEntityId: 7,
      orderDate: new Date('2026-08-01'),
    } as PurchaseOrderHeaderEntity;

    shipMethodService.existsById.mockResolvedValue(true);
    purchaseOrderRepository.findOne.mockResolvedValue(current);
    purchaseOrderRepository.merge.mockImplementation(
      (entity: any, patch: any) => {
        Object.assign(entity, patch);
      },
    );
    purchaseOrderRepository.save.mockImplementation(
      async (entity: any) => entity,
    );

    const result = await service.update(8, 7, {
      shipMethodId: 2,
      orderDate: '2026-09-10',
      status: 2,
    });

    expect(shipMethodService.existsById).toHaveBeenCalledWith(2);
    expect(purchaseOrderRepository.merge).toHaveBeenCalledWith(
      current,
      expect.objectContaining({
        shipMethodId: 2,
        status: 2,
        orderDate: expect.any(Date),
      }),
    );
    expect(result.orderDate).toBeInstanceOf(Date);
    expect(result.status).toBe(2);
  });

  it('should throw when the purchase order is not found for the vendor', async () => {
    purchaseOrderRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999, 7)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(999, 7)).rejects.toThrow(
      'No existe la orden de compra 999 para este vendor',
    );
  });

  it('should update a detail line and recalculate subtotal', async () => {
    const purchaseOrder = { purchaseOrderId: 8, businessEntityId: 7 } as any;
    const line = {
      purchaseOrderId: 8,
      purchaseOrderDetailId: 3,
      orderQty: 2,
      unitPrice: 15,
    } as PurchaseOrderDetailEntity;

    purchaseOrderRepository.findOne.mockResolvedValue(purchaseOrder);
    dataSource.transaction.mockImplementation(async (callback) =>
      callback(manager),
    );
    manager.findOne.mockResolvedValue(line);
    manager.merge.mockImplementation((entity, patch) =>
      Object.assign(entity, patch),
    );
    manager.save.mockResolvedValue({
      ...line,
      dueDate: new Date('2026-09-15'),
    });
    manager.find.mockResolvedValue([{ orderQty: 4, unitPrice: 5 }]);

    const result = await service.updateDetail(8, 7, 3, {
      orderQty: 4,
      dueDate: '2026-09-15',
    });

    expect(manager.findOne).toHaveBeenCalledWith(PurchaseOrderDetailEntity, {
      where: { purchaseOrderId: 8, purchaseOrderDetailId: 3 },
    });
    expect(manager.merge).toHaveBeenCalledWith(
      PurchaseOrderDetailEntity,
      line,
      expect.objectContaining({
        orderQty: 4,
        dueDate: expect.any(Date),
      }),
    );
    expect(result.dueDate).toBeInstanceOf(Date);
  });
});
