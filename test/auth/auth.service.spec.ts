import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../src/modules/auth/auth.service';
import { VendorEntity } from '../../src/modules/auth/entities/vendor.entity';

describe('AuthService', () => {
  let service: AuthService;
  let vendorsRepository: any;
  let jwtService: { signAsync: jest.Mock };

  const baseDto = {
    email: 'vendedor@empresa.com',
    password: '12345678',
    name: 'Distribuidora Ejemplo',
    accountNumber: 'AC-00123',
    creditRating: 3,
    preferredVendorStatus: true,
    activeFlag: true,
    purchasingWebServiceUrl: 'https://miempresa.com/servicio',
  };

  beforeEach(() => {
    vendorsRepository = {
      findOneBy: jest.fn(),
      createQueryBuilder: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    service = new AuthService(
      vendorsRepository,
      jwtService as unknown as JwtService,
    );
  });

  it('should throw ConflictException when registering an existing email', async () => {
    vendorsRepository.findOneBy.mockResolvedValue({
      businessEntityId: 1,
      email: baseDto.email,
    });

    await expect(service.register(baseDto as any)).rejects.toThrow(
      ConflictException,
    );
    await expect(service.register(baseDto as any)).rejects.toThrow(
      'El email ya está registrado',
    );
  });

  it('should register a vendor, hash the password and return a token', async () => {
    vendorsRepository.findOneBy.mockResolvedValue(null);
    vendorsRepository.createQueryBuilder.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ max: 7 }),
    });

    const createdVendor: Partial<VendorEntity> = {
      businessEntityId: 8,
      accountNumber: baseDto.accountNumber,
      name: baseDto.name,
      creditRating: baseDto.creditRating,
      preferredVendorStatus: true,
      activeFlag: true,
      email: baseDto.email,
      password: 'hashedPassword',
    };

    vendorsRepository.create.mockReturnValue(createdVendor);
    vendorsRepository.save.mockResolvedValue(createdVendor);
    jwtService.signAsync.mockResolvedValue('jwt-token');

    const result = await service.register(baseDto as any);

    expect(vendorsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        businessEntityId: 8,
        email: baseDto.email,
        password: expect.any(String),
      }),
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 8,
      email: baseDto.email,
    });
    expect(result.accessToken).toBe('jwt-token');
    expect(result.vendor).toEqual(
      expect.objectContaining({
        businessEntityId: 8,
        email: baseDto.email,
      }),
    );
    expect(result.vendor).not.toHaveProperty('password');
  });

  it('should throw UnauthorizedException for invalid credentials on login', async () => {
    const qb = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };
    vendorsRepository.createQueryBuilder.mockReturnValue(qb);

    await expect(
      service.login({
        email: baseDto.email,
        password: baseDto.password,
      } as any),
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      service.login({
        email: baseDto.email,
        password: baseDto.password,
      } as any),
    ).rejects.toThrow('Credenciales inválidas');
  });

  it('should login successfully and return a token without exposing password', async () => {
    const hashedPassword = await bcrypt.hash(baseDto.password, 10);
    const vendor: Partial<VendorEntity> = {
      businessEntityId: 10,
      email: baseDto.email,
      password: hashedPassword,
      name: baseDto.name,
      accountNumber: baseDto.accountNumber,
      creditRating: baseDto.creditRating,
      preferredVendorStatus: true,
      activeFlag: true,
    };

    vendorsRepository.createQueryBuilder.mockReturnValue({
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(vendor),
    });

    jwtService.signAsync.mockResolvedValue('login-token');

    const result = await service.login({
      email: baseDto.email,
      password: baseDto.password,
    });

    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 10,
      email: baseDto.email,
    });
    expect(result.accessToken).toBe('login-token');
    expect(result.vendor).not.toHaveProperty('password');
    expect(result.vendor.email).toBe(baseDto.email);
  });
});
