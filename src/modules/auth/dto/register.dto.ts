import {
  IsEmail,
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsUrl,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterVendorDto {
  @ApiProperty({ example: 'vendedor@empresa.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '12345678', minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'Distribuidora Ejemplo S.A.' })
  @IsString()
  @MaxLength(50)
  name!: string;

  @ApiProperty({ example: 'AC-00123' })
  @IsString()
  @MaxLength(15)
  accountNumber!: string;

  @ApiProperty({ example: 3, description: 'Calificación crediticia (1-5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  creditRating!: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  preferredVendorStatus?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  activeFlag?: boolean;

  @ApiPropertyOptional({ example: 'https://miempresa.com/servicio' })
  @IsOptional()
  @IsUrl()
  @MaxLength(1024)
  purchasingWebServiceUrl?: string;
}