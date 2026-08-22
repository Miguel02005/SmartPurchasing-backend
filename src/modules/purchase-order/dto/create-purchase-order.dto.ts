import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';

export class CreatePurchaseOrderDto {
  @ApiProperty({ description: 'ID del método de envío', example: 1 })
  @IsInt()
  shipMethodId!: number;

  @ApiProperty({ example: '2026-08-20' })
  @IsDateString()
  orderDate!: string;

  @ApiProperty({ example: '2026-08-25', required: false })
  @IsOptional()
  @IsDateString()
  shipDate?: string;

  @ApiProperty({
    example: 0,
    required: false,
    description: 'Se recalcula al agregar líneas',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  subTotal?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxAmt?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  freight?: number;
}
