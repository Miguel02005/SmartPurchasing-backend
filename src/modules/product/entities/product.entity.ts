import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { VendorEntity } from '../../auth/entities/vendor.entity';

@Entity({ name: 'ProductVendor', schema: 'Purchasing' })
export class ProductVendorEntity {
  @PrimaryColumn({ name: 'ProductID' })
  productId!: number;

  @PrimaryColumn({ name: 'BusinessEntityID' })
  businessEntityId!: number;

  @ManyToOne(() => VendorEntity)
  @JoinColumn({ name: 'BusinessEntityID' })
  vendor!: VendorEntity;

  @Column({ name: 'AverageLeadTime', type: 'int' })
  averageLeadTime!: number;

  @Column({ name: 'StandardPrice', type: 'money' })
  standardPrice!: number;

  @Column({ name: 'LastReceiptCost', type: 'money', nullable: true })
  lastReceiptCost?: number;

  @Column({ name: 'LastReceiptDate', type: 'datetime', nullable: true })
  lastReceiptDate?: Date;

  @Column({ name: 'MinOrderQty', type: 'int' })
  minOrderQty!: number;

  @Column({ name: 'MaxOrderQty', type: 'int' })
  maxOrderQty!: number;

  @Column({ name: 'OnOrderQty', type: 'int', nullable: true })
  onOrderQty?: number;

  @Column({ name: 'UnitMeasureCode', type: 'nchar', length: 3 })
  unitMeasureCode!: string;

  @UpdateDateColumn({ name: 'ModifiedDate' })
  modifiedDate!: Date;
}
