import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PurchaseOrderHeaderEntity } from './entities/purchase-order-header.entity';
import { PurchaseOrderDetailEntity } from './entities/purchase-order-detail.entity';
import { Repository, DataSource } from 'typeorm';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { UpdatePurchaseOrderDetailDto } from './dto/update-purchase-order-detail.dto';

const DEFAULT_EMPLOYEE_ID = 1;

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrderHeaderEntity)
    private readonly purchaseOrderRepository: Repository<PurchaseOrderHeaderEntity>,
    @InjectRepository(PurchaseOrderDetailEntity)
    private readonly purchaseOrderDetailRepository: Repository<PurchaseOrderDetailEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async findByVendor(
    businessEntityId: number,
  ): Promise<PurchaseOrderHeaderEntity[]> {
    return this.purchaseOrderRepository.find({
      where: { businessEntityId },
      relations: { details: true },
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
      relations: { details: true },
      order: { details: { purchaseOrderDetailId: 'ASC' } },
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
    const { details, ...headerDto } = dto;

    const calculatedSubTotal =
      details && details.length > 0
        ? Number(
            details
              .reduce((sum, line) => sum + line.orderQty * line.unitPrice, 0)
              .toFixed(4),
          )
        : undefined;

    const purchaseOrder = this.purchaseOrderRepository.create({
      ...headerDto,
      businessEntityId,
      employeeId: DEFAULT_EMPLOYEE_ID,
      orderDate: new Date(headerDto.orderDate),
      shipDate: headerDto.shipDate ? new Date(headerDto.shipDate) : undefined,
      ...(calculatedSubTotal !== undefined
        ? { subTotal: calculatedSubTotal }
        : {}),
    });

    return this.dataSource
      .transaction(async (manager) => {
        const savedOrder = await manager.save(purchaseOrder);

        if (details && details.length > 0) {
          const defaultDueDate = new Date(
            headerDto.shipDate ?? headerDto.orderDate,
          );
          const detailEntities = details.map((line) =>
            manager.create(PurchaseOrderDetailEntity, {
              ...line,
              purchaseOrderId: savedOrder.purchaseOrderId,
              dueDate: line.dueDate ? new Date(line.dueDate) : defaultDueDate,
              receivedQty: 0,
              rejectedQty: 0,
            }),
          );
          savedOrder.details = await manager.save(detailEntities);
        }

        return savedOrder;
      })
      .catch(() => {
        throw new BadRequestException(
          'No se pudo crear la orden con sus líneas: verifique que los productId y shipMethodId existan',
        );
      });
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

  async updateDetail(
    purchaseOrderId: number,
    businessEntityId: number,
    purchaseOrderDetailId: number,
    dto: UpdatePurchaseOrderDetailDto,
  ): Promise<PurchaseOrderDetailEntity> {
    await this.findOneOrFail(purchaseOrderId, businessEntityId);

    return this.dataSource.transaction(async (manager) => {
      const detail = await manager.findOne(PurchaseOrderDetailEntity, {
        where: { purchaseOrderId, purchaseOrderDetailId },
      });
      if (!detail) {
        throw new NotFoundException(
          `No existe la línea ${purchaseOrderDetailId} en la orden ${purchaseOrderId}`,
        );
      }

      const { dueDate, ...rest } = dto;
      manager.merge(PurchaseOrderDetailEntity, detail, {
        ...rest,
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
      });
      const savedDetail = await manager.save(detail);

      await this.recalculateSubTotal(manager, purchaseOrderId);
      return savedDetail;
    });
  }

  async removeDetail(
    purchaseOrderId: number,
    businessEntityId: number,
    purchaseOrderDetailId: number,
  ): Promise<void> {
    await this.findOneOrFail(purchaseOrderId, businessEntityId);

    await this.dataSource.transaction(async (manager) => {
      const detail = await manager.findOne(PurchaseOrderDetailEntity, {
        where: { purchaseOrderId, purchaseOrderDetailId },
      });
      if (!detail) {
        throw new NotFoundException(
          `No existe la línea ${purchaseOrderDetailId} en la orden ${purchaseOrderId}`,
        );
      }
      await manager.remove(detail);
      await this.recalculateSubTotal(manager, purchaseOrderId);
    });
  }

  private async recalculateSubTotal(
    manager: DataSource['manager'],
    purchaseOrderId: number,
  ): Promise<void> {
    const lines = await manager.find(PurchaseOrderDetailEntity, {
      where: { purchaseOrderId },
    });
    const subTotal = Number(
      lines
        .reduce((sum, line) => sum + line.orderQty * line.unitPrice, 0)
        .toFixed(4),
    );
    await manager.update(PurchaseOrderHeaderEntity, purchaseOrderId, {
      subTotal,
    });
  }
}
