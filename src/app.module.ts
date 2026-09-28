import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { PurchaseOrderModule } from './modules/purchase-order/purchase-order.module';
import { ShipMethodModule } from './modules/ship_method/ship-method.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    ProductModule,
    PurchaseOrderModule,
    ShipMethodModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
