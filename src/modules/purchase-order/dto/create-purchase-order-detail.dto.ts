import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreatePurchaseOrderDetailDto {
  @ApiProperty({ description: 'ID del producto', example: 1 })
  @IsInt()
  productId!: number;

  @ApiProperty({ description: 'Cantidad ordenada', example: 10 })
  @IsInt()
  @Min(1)
  @Max(32767)
  orderQty!: number;

  @ApiProperty({ description: 'Precio unitario', example: 25.5 })
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiProperty({
    example: '2026-08-30',
    required: false,
    description:
      'Fecha esperada de entrega. Si se omite se usa la ShipDate de la orden o su OrderDate',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
