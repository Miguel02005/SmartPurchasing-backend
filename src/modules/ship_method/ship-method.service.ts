import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShipMethodEntity } from './entities/Ship-method.entity';

@Injectable()
export class ShipMethodService {
  constructor(
    @InjectRepository(ShipMethodEntity)
    private readonly shipMethodRepository: Repository<ShipMethodEntity>,
  ) {}

  async findAll(): Promise<ShipMethodEntity[]> {
    return this.shipMethodRepository.find();
  }

  async findOne(shipMethodId: number): Promise<ShipMethodEntity> {
    const shipMethod = await this.shipMethodRepository.findOne({
      where: { shipMethodId },
    });
    if (!shipMethod) {
      throw new NotFoundException(
        `No existe el método de envío con ID ${shipMethodId}`,
      );
    }
    return shipMethod;
  }

  async existsById(shipMethodId: number): Promise<boolean> {
    const count = await this.shipMethodRepository.count({
      where: { shipMethodId },
    });
    return count > 0;
  }
}
