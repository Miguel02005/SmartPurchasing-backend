import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductVendorDto {
  @ApiProperty({ description: 'ID del producto', example: 1 })
  @IsInt()
  productId!: number;

  @ApiProperty({ description: 'ID del vendor', example: 1 })
  @IsInt()
  businessEntityId!: number;

  @ApiProperty({ example: 14, description: 'Días promedio de entrega' })
  @IsInt()
  @Min(0)
  averageLeadTime!: number;

  @ApiProperty({ example: 100, description: 'Precio estándar' })
  @IsNumber()
  @Min(0)
  standardPrice!: number;

  @ApiProperty({
    example: 90,
    description: 'Costo del último recibo',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lastReceiptCost?: number;

  @ApiProperty({
    example: '2023-01-01',
    description: 'Fecha del último recibo',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  lastReceiptDate?: string; // llega como string por HTTP/JSON, se convierte a Date en el service

  @ApiProperty({ example: 10, description: 'Cantidad mínima de pedido' })
  @IsInt()
  @Min(1)
  minOrderQty!: number;

  @ApiProperty({ example: 100, description: 'Cantidad máxima de pedido' })
  @IsInt()
  @Min(1)
  maxOrderQty!: number;

  @ApiProperty({
    example: 50,
    description: 'Cantidad en pedido (opcional)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  onOrderQty?: number;

  @ApiProperty({
    example: 'EA',
    description: 'Código de unidad de medida (3 caracteres)',
  })
  @IsString()
  @Length(1, 3)
  unitMeasureCode!: string;
}
