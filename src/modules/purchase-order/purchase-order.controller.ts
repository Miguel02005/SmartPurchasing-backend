import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PurchaseOrderService } from './purchase-order.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from './dto/update-purchase-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest {
  user: { businessEntityId: number; email: string };
}

@ApiTags('purchase-orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Get('mine')
  findMine(@Request() req: AuthenticatedRequest) {
    return this.purchaseOrderService.findByVendor(req.user.businessEntityId);
  }

  @Post('create')
  create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreatePurchaseOrderDto,
  ) {
    return this.purchaseOrderService.create(dto, req.user.businessEntityId);
  }

  @Get(':purchaseOrderId')
  async findOne(
    @Request() req: AuthenticatedRequest,
    @Param('purchaseOrderId', ParseIntPipe) purchaseOrderId: number,
  ) {
    await this.assertOwnership(purchaseOrderId, req.user.businessEntityId);
    return this.purchaseOrderService.findOne(
      purchaseOrderId,
      req.user.businessEntityId,
    );
  }
  private async assertOwnership(
    purchaseOrderId: number,
    businessEntityId: number,
  ) {
    const exists = await this.purchaseOrderService.existsForVendor(
      purchaseOrderId,
      businessEntityId,
    );
    if (!exists) {
      throw new ForbiddenException(
        'No tienes permiso sobre esta orden de compra',
      );
    }
  }

  @Patch(':purchaseOrderId')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('purchaseOrderId', ParseIntPipe) purchaseOrderId: number,
    @Body() dto: UpdatePurchaseOrderDto,
  ) {
    await this.assertOwnership(purchaseOrderId, req.user.businessEntityId);
    return this.purchaseOrderService.update(
      purchaseOrderId,
      req.user.businessEntityId,
      dto,
    );
  }
}
