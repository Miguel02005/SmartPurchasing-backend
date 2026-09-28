import 'reflect-metadata';
import { Controller, Get, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ProductController } from '../../src/modules/product/product.controller';
import { ProductService } from '../../src/modules/product/product.service';
import { JwtAuthGuard } from '../../src/modules/auth/jwt-auth.guard';

@Controller('swagger-probe')
class SwaggerProbeController {
  @Get()
  ok() {
    return 'ok';
  }
}

@Module({
  controllers: [ProductController, SwaggerProbeController],
  providers: [{ provide: ProductService, useValue: {} }],
})
class SwaggerProbeModule {}

describe('OpenAPI de products', () => {
  let document: any;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SwaggerProbeModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const app = moduleRef.createNestApplication();
    await app.init();

    document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('probe').addBearerAuth().build(),
    );

    await app.close();
  });

  const productVendorProps = () =>
    document.components.schemas.ProductVendorResponseDto.properties;

  const summaryProps = () =>
    document.components.schemas.ProductSummaryDto.properties;

  it('should document GET /products/mine as an array of ProductVendorResponseDto', () => {
    const response =
      document.paths['/products/mine'].get.responses['200'].content[
        'application/json'
      ].schema;

    expect(response.type).toBe('array');
    expect(response.items.$ref).toBe(
      '#/components/schemas/ProductVendorResponseDto',
    );
  });

  it('should document GET /products/{productId} with a single response and 404/400', () => {
    const operation = document.paths['/products/{productId}'].get;
    const params = operation.parameters.map((p: any) => ({
      name: p.name,
      in: p.in,
      required: p.required,
    }));

    expect(params).toEqual([{ name: 'productId', in: 'path', required: true }]);
    expect(
      operation.responses['200'].content['application/json'].schema.$ref,
    ).toBe('#/components/schemas/ProductVendorResponseDto');
    expect(Object.keys(operation.responses)).toEqual(
      expect.arrayContaining(['200', '400', '404']),
    );
  });

  it('should expose a product object with productId, name, productNumber and color', () => {
    expect(productVendorProps().product).toBeDefined();
    expect(productVendorProps().product.allOf).toEqual([
      { $ref: '#/components/schemas/ProductSummaryDto' },
    ]);
    expect(Object.keys(summaryProps())).toEqual([
      'productId',
      'name',
      'productNumber',
      'color',
    ]);
  });

  it('should type the summary fields as scalars, not as object', () => {
    expect(summaryProps().productId.type).toBe('number');
    expect(summaryProps().name.type).toBe('string');
    expect(summaryProps().productNumber.type).toBe('string');
    // Sin `type` explícito la unión `string | null` se documentaría como object.
    expect(summaryProps().color.type).toBe('string');
    expect(summaryProps().color.nullable).toBe(true);
  });

  it('should mark the nullable vendor fields with a scalar type too', () => {
    const props = productVendorProps();
    expect(props.lastReceiptCost.type).toBe('number');
    expect(props.lastReceiptCost.nullable).toBe(true);
    expect(props.lastReceiptDate.type).toBe('string');
    expect(props.onOrderQty.type).toBe('number');
    expect(props.onOrderQty.nullable).toBe(true);
  });

  it('should require the fields that always come from the database', () => {
    expect(document.components.schemas.ProductSummaryDto.required).toEqual([
      'productId',
      'name',
      'productNumber',
    ]);
    expect(
      document.components.schemas.ProductVendorResponseDto.required,
    ).toContain('product');
  });
});
