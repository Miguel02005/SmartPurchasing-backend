import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { VendorEntity } from './entities/vendor.entity';
import { LoginVendorDto } from './dto/login.dto';
import { RegisterVendorDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(VendorEntity)
    private readonly vendorsRepository: Repository<VendorEntity>,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(): Promise<VendorEntity[]> {
    return this.vendorsRepository.find();
  }

  async findOne(id: number): Promise<VendorEntity | null> {
    return this.vendorsRepository.findOneBy({ businessEntityId: id });
  }

  async remove(id: number): Promise<void> {
    await this.vendorsRepository.delete(id);
  }

  async register(
    dto: RegisterVendorDto,
  ): Promise<{ accessToken: string; vendor: Omit<VendorEntity, 'password'> }> {
    const existingVendor = await this.vendorsRepository.findOneBy({
      email: dto.email,
    });
    if (existingVendor) {
      throw new ConflictException('El email ya está registrado');
    }
 
    const hashedPassword = await bcrypt.hash(dto.password, 10);
 
    // BusinessEntityID no es autoincremental en la tabla real de AdventureWorks,
    // así que calculamos el siguiente disponible. Si en el futuro insertas primero
    // en Person.BusinessEntity, usa ese ID en su lugar.
    const { max } = (await this.vendorsRepository
      .createQueryBuilder('vendor')
      .select('MAX(vendor.businessEntityId)', 'max')
      .getRawOne<{ max: number | null }>()) ?? { max: 0 };
    const nextId = (max ?? 0) + 1;
 
    const vendor = this.vendorsRepository.create({
      businessEntityId: nextId,
      accountNumber: dto.accountNumber,
      name: dto.name,
      creditRating: dto.creditRating,
      preferredVendorStatus: dto.preferredVendorStatus ?? true,
      activeFlag: dto.activeFlag ?? true,
      purchasingWebServiceUrl: dto.purchasingWebServiceUrl,
      email: dto.email,
      password: hashedPassword,
    });
 
    const savedVendor = await this.vendorsRepository.save(vendor);
 
    const payload = {
      sub: savedVendor.businessEntityId,
      email: savedVendor.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);
 
    const { password, ...safeVendor } = savedVendor;
    return { accessToken, vendor: safeVendor };
  }

  async login(
    dto: LoginVendorDto,
  ): Promise<{ accessToken: string; vendor: Omit<VendorEntity, 'password'> }> {
    const vendor = await this.vendorsRepository
      .createQueryBuilder('vendor')
      .addSelect('vendor.password')
      .where('vendor.email = :email', { email: dto.email })
      .getOne();

    if (!vendor) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const passwordMatches = await bcrypt.compare(dto.password, vendor.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: vendor.businessEntityId, email: vendor.email };
    const accessToken = await this.jwtService.signAsync(payload);

    const { password, ...safeVendor } = vendor;
    return { accessToken, vendor: safeVendor };
  }
}
