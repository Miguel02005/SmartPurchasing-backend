import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { VendorEntity } from '../../auth/entities/vendor.entity';
import { PurchaseOrderDetailEntity } from './purchase-order-detail.entity';
import { ShipMethodEntity } from 'src/modules/ship_method/entities/Ship-method.entity';

@Entity({ name: 'PurchaseOrderHeader', schema: 'Purchasing' })
export class PurchaseOrderHeaderEntity {
  @PrimaryGeneratedColumn({ name: 'PurchaseOrderID' })
  purchaseOrderId!: number;

  @ManyToOne(() => ShipMethodEntity, (shipMethod) => shipMethod.purchaseOrders)
  @JoinColumn({ name: 'ShipMethodID' })
  shipMethod!: ShipMethodEntity;

  @Column({ name: 'VendorID' })
  businessEntityId!: number;

  @Column({ name: 'EmployeeID' })
  employeeId!: number;

  @ManyToOne(() => VendorEntity)
  @JoinColumn({ name: 'VendorID' })
  vendor!: VendorEntity;

  @OneToMany(() => PurchaseOrderDetailEntity, (detail) => detail.purchaseOrder)
  details!: PurchaseOrderDetailEntity[];

  @Column({ name: 'RevisionNumber', type: 'tinyint', default: 0 })
  revisionNumber!: number;

  @Column({ name: 'Status', type: 'tinyint', default: 1 })
  status!: number;

  @Column({ name: 'OrderDate', type: 'datetime' })
  orderDate!: Date;

  @Column({ name: 'ShipDate', type: 'datetime', nullable: true })
  shipDate?: Date;

  @Column({ name: 'SubTotal', type: 'money', default: 0 })
  subTotal!: number;

  @Column({ name: 'TaxAmt', type: 'money', default: 0 })
  taxAmt!: number;

  @Column({ name: 'Freight', type: 'money', default: 0 })
  freight!: number;

  @Column({ name: 'TotalDue', type: 'money', insert: false, update: false })
  totalDue!: number;

  @UpdateDateColumn({ name: 'ModifiedDate' })
  modifiedDate!: Date;
}
