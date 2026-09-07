import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PurchaseOrderHeaderEntity } from '../../purchase-order/entities/purchase-order-header.entity';

@Entity({ name: 'ShipMethod', schema: 'Purchasing' })
export class ShipMethodEntity {
  @PrimaryGeneratedColumn({ name: 'ShipMethodID' })
  shipMethodId!: number;

  @Column({ name: 'Name', type: 'nvarchar', length: 50, unique: true })
  name!: string;

  @Column({ name: 'ShipBase', type: 'money' })
  shipBase!: number;

  @Column({ name: 'ShipRate', type: 'money' })
  shipRate!: number;

  @Column({
    name: 'rowguid',
    type: 'uniqueidentifier',
    default: () => 'NEWID()',
  })
  rowguid!: string;

  @UpdateDateColumn({ name: 'ModifiedDate' })
  modifiedDate!: Date;

  @OneToMany(() => PurchaseOrderHeaderEntity, (order) => order.shipMethod)
  purchaseOrders!: PurchaseOrderHeaderEntity[];
}
