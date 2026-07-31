import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'Vendor', schema: 'Purchasing' })
export class VendorEntity {
  // OJO: ya no es @PrimaryGeneratedColumn (ver explicación abajo)
  @PrimaryColumn({ name: 'BusinessEntityID' })
  businessEntityId!: number;

  @Column({ name: 'AccountNumber', type: 'nvarchar', length: 15, unique: true })
  accountNumber!: string;

  @Column({ name: 'Name', type: 'nvarchar', length: 50 })
  name!: string;

  @Column({ name: 'CreditRating', type: 'tinyint' })
  creditRating!: number;

  @Column({ name: 'PreferredVendorStatus', type: 'bit', default: true })
  preferredVendorStatus!: boolean;

  @Column({ name: 'ActiveFlag', type: 'bit', default: true })
  activeFlag!: boolean;

  @Column({
    name: 'PurchasingWebServiceURL',
    type: 'nvarchar',
    length: 1024,
    nullable: true,
  })
  purchasingWebServiceUrl?: string;

  // --- Campos que vamos a agregar nosotros a la tabla real (ALTER TABLE manual) ---

  @Column({ name: 'Email', type: 'nvarchar', length: 256, unique: true })
  email!: string;

  @Column({ name: 'Password', type: 'nvarchar', length: 60, select: false })
  password!: string;

  @UpdateDateColumn({ name: 'ModifiedDate' })
  modifiedDate!: Date;
}
