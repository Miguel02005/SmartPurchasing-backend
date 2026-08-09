import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVendorEntity } from './entities/product.entity';
import { CreateProductVendorDto } from './dto/create-product.dto';
import { UpdateProductVendorDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductVendorEntity)
    private readonly productRepository: Repository<ProductVendorEntity>,
  ) {}

  async findByVendor(businessEntityId: number): Promise<ProductVendorEntity[]> {
    return this.productRepository.find({
      where: { businessEntityId },
    });
  }
  async existsForVendor(
    productId: number,
    businessEntityId: number,
  ): Promise<boolean> {
    const count = await this.productRepository.count({
      where: { productId, businessEntityId },
    });
    return count > 0;
  }
  async create(dto: CreateProductVendorDto): Promise<ProductVendorEntity> {
    const exists = await this.productRepository.findOne({
      where: {
        productId: dto.productId,
        businessEntityId: dto.businessEntityId,
      },
    });
    if (exists) {
      throw new ConflictException(
        `Product with ID ${dto.productId} already exists for vendor ${dto.businessEntityId}`,
      );
    }
    const productVendor = this.productRepository.create(dto);
    return this.productRepository.save(productVendor);
  }
  private async findOneOrFail(
    productId: number,
    businessEntityId: number,
  ): Promise<ProductVendorEntity> {
    const productVendor = await this.productRepository.findOne({
      where: { productId, businessEntityId },
    });
    if (!productVendor) {
      throw new NotFoundException(
        `No existe relación producto-vendor con productId=${productId} y businessEntityId=${businessEntityId}`,
      );
    }
    return productVendor;
  }

  async update(
    productId: number,
    businessEntityId: number,
    dto: UpdateProductVendorDto,
  ): Promise<ProductVendorEntity> {
    const productVendor = await this.findOneOrFail(productId, businessEntityId);

    // dto.lastReceiptDate llega como string (así viaja por HTTP/JSON),
    // pero la entidad espera un objeto Date real -> hay que convertirlo antes de merge()
    const { lastReceiptDate, ...rest } = dto;

    this.productRepository.merge(productVendor, {
      ...rest,
      ...(lastReceiptDate
        ? { lastReceiptDate: new Date(lastReceiptDate) }
        : {}),
    });
    return this.productRepository.save(productVendor);
  }
  async remove(productId: number, businessEntityId: number): Promise<void> {
    const productVendor = await this.findOneOrFail(productId, businessEntityId);
    await this.productRepository.remove(productVendor);
  }
}
