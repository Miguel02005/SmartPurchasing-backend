import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PurchaseOrderHeaderEntity } from './entities/purchase-order-header.entity';
import { Repository } from 'typeorm';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';

const DEFAULT_EMPLOYEE_ID = 1;

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrderHeaderEntity)
    private readonly purchaseOrderRepository: Repository<PurchaseOrderHeaderEntity>,
  ) {}

  async findByVendor(
    businessEntityId: number,
  ): Promise<PurchaseOrderHeaderEntity[]> {
    return this.purchaseOrderRepository.find({
      where: { businessEntityId },
      order: { orderDate: 'DESC' },
    });
  }

  async existsForVendor(
    purchaseOrderId: number,
    businessEntityId: number,
  ): Promise<boolean> {
    const count = await this.purchaseOrderRepository.count({
      where: { purchaseOrderId, businessEntityId },
    });
    return count > 0;
  }

  async findOne(
    purchaseOrderId: number,
    businessEntityId: number,
  ): Promise<PurchaseOrderHeaderEntity> {
    return this.findOneOrFail(purchaseOrderId, businessEntityId);
  }

  private async findOneOrFail(
    purchaseOrderId: number,
    businessEntityId: number,
  ): Promise<PurchaseOrderHeaderEntity> {
    const purchaseOrder = await this.purchaseOrderRepository.findOne({
      where: { purchaseOrderId, businessEntityId },
    });
    if (!purchaseOrder) {
      throw new NotFoundException(
        `No existe la orden de compra ${purchaseOrderId} para este vendor`,
      );
    }
    return purchaseOrder;
  }

  async create(
    dto: CreatePurchaseOrderDto,
    businessEntityId: number,
  ): Promise<PurchaseOrderHeaderEntity> {
    const purchaseOrder = this.purchaseOrderRepository.create({
      ...dto,
      businessEntityId,
      employeeId: DEFAULT_EMPLOYEE_ID,
      orderDate: new Date(dto.orderDate),
      shipDate: dto.shipDate ? new Date(dto.shipDate) : undefined,
    });
    return this.purchaseOrderRepository.save(purchaseOrder);
  }
  async update(
    purchaseOrderId: number,
    businessEntityId: number,
    dto: UpdatePurchaseOrderDto,
  ): Promise<PurchaseOrderHeaderEntity> {
    const purchaseOrder = await this.findOneOrFail(
      purchaseOrderId,
      businessEntityId,
    );
    const { orderDate, shipDate, ...rest } = dto;

    this.purchaseOrderRepository.merge(purchaseOrder, {
      ...rest,
      ...(orderDate ? { orderDate: new Date(orderDate) } : {}),
      ...(shipDate ? { shipDate: new Date(shipDate) } : {}),
    });
    return this.purchaseOrderRepository.save(purchaseOrder);
  }
}
