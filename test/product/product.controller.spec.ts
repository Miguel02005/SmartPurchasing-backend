import 'reflect-metadata';
import {
  INestApplication,
  Module,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ProductController } from '../../src/modules/product/product.controller';
import { ProductService } from '../../src/modules/product/product.service';
import { JwtAuthGuard } from '../../src/modules/auth/jwt-auth.guard';

const BUSINESS_ENTITY_ID = 1492;

class FakeJwtAuthGuard {
  canActivate(context: any) {
    context.switchToHttp().getRequest().user = {
      businessEntityId: BUSINESS_ENTITY_ID,
      email: 'vendor@test.com',
    };
    return true;
  }
}

let service: {
  findByVendor: jest.Mock;
  findOne: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
};

@Module({
  controllers: [ProductController],
  // useFactory (y no useValue) para que resuelva el mock que crea cada beforeEach.
  providers: [{ provide: ProductService, useFactory: () => service }],
})
class ProductHttpModule {}

describe('ProductController (HTTP)', () => {
  let app: INestApplication;

  // Filas reales de Production.Product / Purchasing.ProductVendor de AdventureWorks.
  const rows = [
    {
      productId: 1,
      businessEntityId: BUSINESS_ENTITY_ID,
      averageLeadTime: 15,
      standardPrice: 0,
      lastReceiptCost: 0,
      lastReceiptDate: null,
      minOrderQty: 1,
      maxOrderQty: 100,
      onOrderQty: 0,
      unitMeasureCode: 'EA',
      modifiedDate: new Date('2008-04-30T00:00:00.000Z'),
      product: {
        productId: 1,
        name: 'Adjustable Race',
        productNumber: 'AR-5381',
        color: null,
      },
    },
    {
      productId: 707,
      businessEntityId: BUSINESS_ENTITY_ID,
      averageLeadTime: 2,
      standardPrice: 34.99,
      lastReceiptCost: 13.0863,
      lastReceiptDate: new Date('2011-08-01T00:00:00.000Z'),
      minOrderQty: 1,
      maxOrderQty: 100,
      onOrderQty: 0,
      unitMeasureCode: 'EA',
      modifiedDate: new Date('2011-05-31T00:00:00.000Z'),
      product: {
        productId: 707,
        name: 'Sport-100 Helmet, Red',
        productNumber: 'HL-U509-R',
        color: 'Red',
      },
    },
    {
      productId: 771,
      businessEntityId: BUSINESS_ENTITY_ID,
      averageLeadTime: 4,
      standardPrice: 3399.99,
      lastReceiptCost: 1912.1544,
      lastReceiptDate: new Date('2013-06-30T00:00:00.000Z'),
      minOrderQty: 1,
      maxOrderQty: 100,
      onOrderQty: 0,
      unitMeasureCode: 'EA',
      modifiedDate: new Date('2011-05-31T00:00:00.000Z'),
      product: {
        productId: 771,
        name: 'Mountain-100 Silver, 38',
        productNumber: 'BK-M82S-38',
        color: 'Silver',
      },
    },
  ];

  const toResponse = (row: any) => ({
    productId: row.productId,
    businessEntityId: row.businessEntityId,
    averageLeadTime: row.averageLeadTime,
    standardPrice: row.standardPrice,
    lastReceiptCost: row.lastReceiptCost,
    lastReceiptDate: row.lastReceiptDate,
    minOrderQty: row.minOrderQty,
    maxOrderQty: row.maxOrderQty,
    onOrderQty: row.onOrderQty,
    unitMeasureCode: row.unitMeasureCode,
    product: row.product,
    modifiedDate: row.modifiedDate,
  });

  beforeEach(async () => {
    service = {
      findByVendor: jest.fn().mockResolvedValue(rows.map(toResponse)),
      findOne: jest.fn().mockImplementation((productId: number) => {
        const row = rows.find((r) => r.productId === productId);
        if (!row) {
          throw new NotFoundException(
            `No existe relación producto-vendor con productId=${productId} y businessEntityId=${BUSINESS_ENTITY_ID}`,
          );
        }
        return Promise.resolve(toResponse(row));
      }),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [ProductHttpModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(FakeJwtAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /products/mine', () => {
    it('should list every product with its catalog data', async () => {
      const res = await request(app.getHttpServer())
        .get('/products/mine')
        .expect(200);

      expect(res.body).toHaveLength(3);
      expect(res.body.map((r: any) => r.product.name)).toEqual([
        'Adjustable Race',
        'Sport-100 Helmet, Red',
        'Mountain-100 Silver, 38',
      ]);
      expect(res.body[0].product).toEqual({
        productId: 1,
        name: 'Adjustable Race',
        productNumber: 'AR-5381',
        color: null,
      });
      expect(res.body[1].product.color).toBe('Red');
      expect(res.body[2].product.productNumber).toBe('BK-M82S-38');
    });

    it('should not be captured by the :productId route', async () => {
      await request(app.getHttpServer()).get('/products/mine').expect(200);
      expect(service.findOne).not.toHaveBeenCalled();
    });
  });

  describe('GET /products/:productId', () => {
    it.each([
      [1, 'Adjustable Race', 'AR-5381', null, null],
      [707, 'Sport-100 Helmet, Red', 'HL-U509-R', 'Red', expect.any(String)],
      [
        771,
        'Mountain-100 Silver, 38',
        'BK-M82S-38',
        'Silver',
        expect.any(String),
      ],
    ])(
      'should return the catalog data for productId %i',
      async (productId, name, productNumber, color, lastReceiptDate) => {
        const res = await request(app.getHttpServer())
          .get(`/products/${productId}`)
          .expect(200);

        expect(res.body).toEqual({
          productId,
          businessEntityId: BUSINESS_ENTITY_ID,
          averageLeadTime: expect.any(Number),
          standardPrice: expect.any(Number),
          lastReceiptCost: expect.any(Number),
          lastReceiptDate,
          minOrderQty: expect.any(Number),
          maxOrderQty: expect.any(Number),
          onOrderQty: expect.any(Number),
          unitMeasureCode: 'EA',
          product: { productId, name, productNumber, color },
          modifiedDate: expect.any(String),
        });
        expect(service.findOne).toHaveBeenCalledWith(
          productId,
          BUSINESS_ENTITY_ID,
        );
      },
    );

    it('should return 404 when the productId does not match', async () => {
      const res = await request(app.getHttpServer())
        .get('/products/999999')
        .expect(404);

      expect(res.body.message).toBe(
        'No existe relación producto-vendor con productId=999999 y businessEntityId=1492',
      );
    });

    it('should return 400 when the productId is not a number', async () => {
      await request(app.getHttpServer()).get('/products/abc').expect(400);
    });
  });
});
