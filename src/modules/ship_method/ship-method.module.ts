import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipMethodEntity } from './entities/Ship-method.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShipMethodEntity])],
  exports: [TypeOrmModule],
})
export class ShipMethodModule {}
