import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProductVendorEntity } from './product.entity';

@Entity({ name: 'Product', schema: 'Production' })
export class ProductEntity {
  @PrimaryColumn({ name: 'ProductID' })
  productId!: number;

  @Column({ name: 'Name', type: 'nvarchar', length: 150 })
  name!: string;

  @Column({ name: 'ProductNumber', type: 'nvarchar', length: 25 })
  productNumber!: string;

  @Column({ name: 'MakeFlag', type: 'bit' })
  makeFlag!: boolean;

  @Column({ name: 'FinishedGoodsFlag', type: 'bit' })
  finishedGoodsFlag!: boolean;

  @Column({ name: 'Color', type: 'nvarchar', length: 15, nullable: true })
  color?: string;

  @Column({ name: 'SafetyStockLevel', type: 'smallint' })
  safetyStockLevel!: number;

  @Column({ name: 'ReorderPoint', type: 'smallint' })
  reorderPoint!: number;

  @Column({
    name: 'StandardCost',
    type: 'numeric',
    precision: 10,
    scale: 4,
    nullable: true,
  })
  standardCost?: number;

  @Column({ name: 'ListPrice', type: 'numeric', precision: 12, scale: 4 })
  listPrice!: number;

  @Column({ name: 'Size', type: 'nvarchar', length: 8, nullable: true })
  size?: string;

  @Column({
    name: 'SizeUnitMeasureCode',
    type: 'nchar',
    length: 3,
    nullable: true,
  })
  sizeUnitMeasureCode?: string;

  @Column({
    name: 'WeightUnitMeasureCode',
    type: 'nchar',
    length: 3,
    nullable: true,
  })
  weightUnitMeasureCode?: string;

  @Column({
    name: 'Weight',
    type: 'numeric',
    precision: 9,
    scale: 4,
    nullable: true,
  })
  weight?: number;

  @Column({ name: 'DaysToManufacture', type: 'int' })
  daysToManufacture!: number;

  @Column({ name: 'ProductLine', type: 'nvarchar', length: 2, nullable: true })
  productLine?: string;

  // "Class" es palabra reservada de T-SQL, por eso la propiedad
  // se llama productClass aunque la columna real se llame Class.
  @Column({ name: 'Class', type: 'nvarchar', length: 2, nullable: true })
  productClass?: string;

  @Column({ name: 'Style', type: 'nvarchar', length: 2, nullable: true })
  style?: string;

  @Column({ name: 'ProductSubcategoryID', type: 'int', nullable: true })
  productSubcategoryId?: number;

  @Column({ name: 'ProductModelID', type: 'int', nullable: true })
  productModelId?: number;

  @Column({ name: 'SellStartDate', type: 'datetime', nullable: true })
  sellStartDate?: Date;

  @Column({ name: 'SellEndDate', type: 'datetime', nullable: true })
  sellEndDate?: Date;

  @Column({ name: 'DiscontinuedDate', type: 'datetime', nullable: true })
  discontinuedDate?: Date;

  @Column({
    name: 'rowguid',
    type: 'uniqueidentifier',
    default: () => 'NEWID()',
  })
  rowguid!: string;

  @UpdateDateColumn({ name: 'ModifiedDate' })
  modifiedDate!: Date;

  @OneToMany(
    () => ProductVendorEntity,
    (productVendor) => productVendor.product,
  )
  productVendors!: ProductVendorEntity[];
}
