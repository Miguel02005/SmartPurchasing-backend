import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipMethodEntity } from './entities/Ship-method.entity';
import { ShipMethodController } from './ship-method.controller';
import { ShipMethodService } from './ship-method.service';

@Module({
  imports: [TypeOrmModule.forFeature([ShipMethodEntity])],
  controllers: [ShipMethodController],
  providers: [ShipMethodService],
  exports: [ShipMethodService],
})
export class ShipMethodModule {}
