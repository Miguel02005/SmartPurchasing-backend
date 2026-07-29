import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('vendor')
export class VendorEntity {
  @PrimaryGeneratedColumn({ name: 'BusinessEntityID' })
  businessEntityId!: number;

  @Column({ name: 'AccountNumber', type: 'varchar', length: 10, unique: true })
  accountNumber!: string;

  @Column({ name: 'Name', type: 'varchar', length: 50 })
  name!: string;

  @Column({ name: 'CreditRating', type: 'smallint' })
  creditRating!: number;

  @Column({ name: 'PreferredVendorStatus', type: 'boolean', default: true })
  preferredVendorStatus!: boolean;

  @Column({ name: 'ActiveFlag', type: 'boolean', default: true })
  activeFlag!: boolean;

  @Column({
    name: 'PurchasingWebServiceURL',
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  purchasingWebServiceUrl?: string;

  @Column({ name: 'Email', type: 'varchar', length: 256, unique: true })
  email!: string;

  @Column({ name: 'Password', type: 'varchar', length: 60, select: false })
  password!: string;

  @CreateDateColumn({ name: 'CreatedDate' })
  createdDate!: Date;

  @UpdateDateColumn({ name: 'ModifiedDate' })
  modifiedDate!: Date;
}
