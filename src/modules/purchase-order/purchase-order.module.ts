import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderHeaderEntity } from './entities/purchase-order-header.entity';
import { PurchaseOrderDetailEntity } from './entities/purchase-order-detail.entity';
import { PurchaseOrderService } from './purchase-order.service';
import { PurchaseOrderController } from './purchase-order.controller';
import { ShipMethodModule } from '../ship_method/ship-method.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchaseOrderHeaderEntity,
      PurchaseOrderDetailEntity,
    ]),
    ShipMethodModule,
  ],
  controllers: [PurchaseOrderController],
  providers: [PurchaseOrderService],
  exports: [PurchaseOrderService],
})
export class PurchaseOrderModule {}
