import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from './product.service';
import { CreateProductVendorDto } from './dto/create-product.dto';
import { UpdateProductVendorDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { businessEntityId: number; email: string };
}

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @Get('mine')
  findMine(@Request() req: AuthenticatedRequest) {
    return this.productService.findByVendor(req.user.businessEntityId);
  }
  @Post('create')
  create(
    @Body() dto: CreateProductVendorDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.productService.create({
      ...dto,
      businessEntityId: req.user.businessEntityId,
    });
  }
  private async assertOwnership(productId: number, businessEntityId: number) {
    const exists = await this.productService.existsForVendor(
      productId,
      businessEntityId,
    );
    if (!exists) {
      throw new ForbiddenException(
        `No tiene permiso para modificar este producto`,
      );
    }
  }
  @Patch(':productId')
  async update(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductVendorDto,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.assertOwnership(productId, req.user.businessEntityId);
    return this.productService.update(
      productId,
      req.user.businessEntityId,
      dto,
    );
  }
  @Delete(':productId')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('productId', ParseIntPipe) productId: number,
    @Request() req: AuthenticatedRequest,
  ) {
    await this.assertOwnership(productId, req.user.businessEntityId);
    await this.productService.remove(productId, req.user.businessEntityId);
    return {
      message: `Producto ${productId} eliminado de tu catálogo correctamente`,
    };
  }
}
