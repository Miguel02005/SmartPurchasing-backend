import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ShipMethodService } from './ship-method.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('ship-methods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ship-methods')
export class ShipMethodController {
  constructor(private readonly shipMethodService: ShipMethodService) {}

  @Get()
  findAll() {
    return this.shipMethodService.findAll();
  }

  @Get(':shipMethodId')
  findOne(@Param('shipMethodId', ParseIntPipe) shipMethodId: number) {
    return this.shipMethodService.findOne(shipMethodId);
  }
}
