import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { VendorEntity } from './entities/vendor.entity';
import { LoginVendorDto } from './dto/login.dto';

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
