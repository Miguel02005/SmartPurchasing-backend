import {
  Body,
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginVendorDto } from './dto/login.dto';
import { VendorEntity } from './entities/vendor.entity';
import { RegisterVendorDto } from './dto/register.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body() loginDto: LoginVendorDto,
  ): Promise<{ accessToken: string; vendor: Omit<VendorEntity, 'password'> }> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(
    @Body() registerDto: RegisterVendorDto,
  ): Promise<{ accessToken: string; vendor: Omit<VendorEntity, 'password'> }> {
    return this.authService.register(registerDto);
  }

  // Ruta de ejemplo protegida: solo responde si el token es válido
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  getProfile(
    @Request() req: { user: { businessEntityId: number; email: string } },
  ) {
    return req.user;
  }
}
