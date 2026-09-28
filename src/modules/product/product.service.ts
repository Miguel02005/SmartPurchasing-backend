import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type FindOptionsRelations } from 'typeorm';
import { ProductVendorEntity } from './entities/product.entity';
import { CreateProductVendorDto } from './dto/create-product.dto';
import { UpdateProductVendorDto } from './dto/update-product.dto';
import {
  ProductVendorResponseDto,
  ProductSummaryDto,
} from './dto/product-vendor-response.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(ProductVendorEntity)
    private readonly productRepository: Repository<ProductVendorEntity>,
  ) {}

  private toResponse(entity: ProductVendorEntity): ProductVendorResponseDto {
    // El LEFT JOIN puede devolver product = null solo si la fila de
    // Purchasing.ProductVendor quedara huérfana (lo impide la FK hacia
    // Production.Product). Prefiero fallar con un mensaje claro a devolver
    // un producto con name/productNumber vacíos, que parecerían datos válidos.
    if (!entity.product) {
      throw new InternalServerErrorException(
        `La relación producto-vendor con productId=${entity.productId} y businessEntityId=${entity.businessEntityId} no tiene producto asociado en Production.Product`,
      );
    }
    const product: ProductSummaryDto = {
      productId: entity.product.productId,
      name: entity.product.name,
      productNumber: entity.product.productNumber,
      color: entity.product.color ?? null,
    };
    return {
      productId: entity.productId,
      businessEntityId: entity.businessEntityId,
      averageLeadTime: entity.averageLeadTime,
      standardPrice: entity.standardPrice,
      lastReceiptCost: entity.lastReceiptCost ?? null,
      lastReceiptDate: entity.lastReceiptDate ?? null,
      minOrderQty: entity.minOrderQty,
      maxOrderQty: entity.maxOrderQty,
      onOrderQty: entity.onOrderQty ?? null,
      unitMeasureCode: entity.unitMeasureCode,
      product,
      modifiedDate: entity.modifiedDate,
    };
  }

  async findByVendor(
    businessEntityId: number,
  ): Promise<ProductVendorResponseDto[]> {
    const productVendors = await this.productRepository.find({
      where: { businessEntityId },
      relations: { product: true },
    });
    return productVendors.map((productVendor) =>
      this.toResponse(productVendor),
    );
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
    relations?: FindOptionsRelations<ProductVendorEntity>,
  ): Promise<ProductVendorEntity> {
    const productVendor = await this.productRepository.findOne({
      where: { productId, businessEntityId },
      relations,
    });
    if (!productVendor) {
      throw new NotFoundException(
        `No existe relación producto-vendor con productId=${productId} y businessEntityId=${businessEntityId}`,
      );
    }
    return productVendor;
  }

  async findOne(
    productId: number,
    businessEntityId: number,
  ): Promise<ProductVendorResponseDto> {
    const productVendor = await this.findOneOrFail(
      productId,
      businessEntityId,
      { product: true },
    );
    return this.toResponse(productVendor);
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
