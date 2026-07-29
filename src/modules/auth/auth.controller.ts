import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginVendorDto } from './dto/login.dto';
import { VendorEntity } from './entities/vendor.entity';
import { ApiTags } from '@nestjs/swagger';

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
}
