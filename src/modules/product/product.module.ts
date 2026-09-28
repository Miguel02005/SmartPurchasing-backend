import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductVendorEntity } from './entities/product.entity';
import { ProductEntity } from './entities/production-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVendorEntity, ProductEntity])],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
