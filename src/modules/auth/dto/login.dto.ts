import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginVendorDto {
  @ApiProperty({ example: 'vendedor@empresa.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '12345678', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
