import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateProductVendorDto } from './create-product.dto';

export class UpdateProductVendorDto extends PartialType(
  OmitType(CreateProductVendorDto, ['productId', 'businessEntityId'] as const),
) {}
