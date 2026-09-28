import { PartialType, OmitType } from '@nestjs/swagger';
import { CreatePurchaseOrderDetailDto } from './create-purchase-order-detail.dto';

export class UpdatePurchaseOrderDetailDto extends PartialType(
  OmitType(CreatePurchaseOrderDetailDto, ['productId'] as const),
) {}
