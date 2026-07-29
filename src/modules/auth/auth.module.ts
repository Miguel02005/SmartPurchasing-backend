import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorsController } from './auth.controller';
import { AuthService } from './auth.service';
import { VendorEntity } from './entities/vendor.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([VendorEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [VendorsController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
