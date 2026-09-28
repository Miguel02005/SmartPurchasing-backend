import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductSummaryDto {
  @ApiProperty({
    example: 1,
    description: 'Id del producto en Production.Product',
  })
  productId!: number;

  @ApiProperty({ example: 'Adjustable Race' })
  name!: string;

  @ApiProperty({ example: 'AR-9981' })
  productNumber!: string;

  @ApiPropertyOptional({
    example: 'Black',
    type: String,
    nullable: true,
    description: 'Color del producto; puede venir null en la base',
  })
  color?: string | null;
}

export class ProductVendorResponseDto {
  @ApiProperty({ example: 1 })
  productId!: number;

  @ApiProperty({ example: 1492 })
  businessEntityId!: number;

  @ApiProperty({ example: 15 })
  averageLeadTime!: number;

  @ApiProperty({ example: 45.12 })
  standardPrice!: number;

  @ApiPropertyOptional({
    example: 43.99,
    type: Number,
    nullable: true,
  })
  lastReceiptCost?: number | null;

  @ApiPropertyOptional({
    example: '2024-01-15T00:00:00.000Z',
    nullable: true,
    type: String,
    format: 'date-time',
  })
  lastReceiptDate?: Date | null;

  @ApiProperty({ example: 1 })
  minOrderQty!: number;

  @ApiProperty({ example: 100 })
  maxOrderQty!: number;

  @ApiPropertyOptional({
    example: 0,
    type: Number,
    nullable: true,
  })
  onOrderQty?: number | null;

  @ApiProperty({ example: 'EA' })
  unitMeasureCode!: string;

  @ApiProperty({
    type: ProductSummaryDto,
    description: 'Datos del producto catalogado en Production.Product',
  })
  product!: ProductSummaryDto;

  @ApiProperty({
    example: '2024-02-01T00:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  modifiedDate!: Date;
}
