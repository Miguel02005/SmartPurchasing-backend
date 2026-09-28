import { PartialType, ApiProperty, OmitType } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { CreatePurchaseOrderDto } from './create-purchase-order.dto';

export class UpdatePurchaseOrderDto extends PartialType(
  OmitType(CreatePurchaseOrderDto, ['details'] as const),
) {
  @ApiProperty({
    example: 2,
    required: false,
    description: '1=Pending, 2=Approved, 3=Rejected, 4=Complete',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  status?: number;
}
