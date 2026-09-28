import {
  Entity,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PurchaseOrderHeaderEntity } from './purchase-order-header.entity';

@Entity({ name: 'PurchaseOrderDetail', schema: 'Purchasing' })
export class PurchaseOrderDetailEntity {
  @PrimaryColumn({ name: 'PurchaseOrderID' })
  purchaseOrderId!: number;

  @PrimaryGeneratedColumn({ name: 'PurchaseOrderDetailID' })
  purchaseOrderDetailId!: number;

  @ManyToOne(() => PurchaseOrderHeaderEntity, (header) => header.details)
  @JoinColumn({ name: 'PurchaseOrderID' })
  purchaseOrder!: PurchaseOrderHeaderEntity;

  @Column({ name: 'DueDate', type: 'datetime' })
  dueDate!: Date;

  @Column({ name: 'OrderQty', type: 'smallint' })
  orderQty!: number;

  @Column({ name: 'ProductID' })
  productId!: number;

  @Column({ name: 'UnitPrice', type: 'money' })
  unitPrice!: number;

  @Column({ name: 'LineTotal', type: 'money', insert: false, update: false })
  lineTotal!: number;

  @Column({ name: 'ReceivedQty', type: 'decimal', default: 0 })
  receivedQty!: number;

  @Column({ name: 'RejectedQty', type: 'decimal', default: 0 })
  rejectedQty!: number;

  @Column({
    name: 'StockedQty',
    type: 'decimal',
    insert: false,
    update: false,
  })
  stockedQty!: number;

  @UpdateDateColumn({ name: 'ModifiedDate' })
  modifiedDate!: Date;
}
