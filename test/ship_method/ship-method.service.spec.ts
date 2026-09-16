import { NotFoundException } from '@nestjs/common';
import { ShipMethodService } from '../../src/modules/ship_method/ship-method.service';
import { ShipMethodEntity } from '../../src/modules/ship_method/entities/Ship-method.entity';

describe('ShipMethodService', () => {
  let service: ShipMethodService;
  let shipMethodRepository: any;

  beforeEach(() => {
    shipMethodRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
    };

    service = new ShipMethodService(shipMethodRepository);
  });

  it('should return all ship methods', async () => {
    const methods = [{ shipMethodId: 1, name: 'Road' }] as ShipMethodEntity[];
    shipMethodRepository.find.mockResolvedValue(methods);

    await expect(service.findAll()).resolves.toEqual(methods);
    expect(shipMethodRepository.find).toHaveBeenCalledTimes(1);
  });

  it('should return a ship method when it exists', async () => {
    const method = { shipMethodId: 2, name: 'Air' } as ShipMethodEntity;
    shipMethodRepository.findOne.mockResolvedValue(method);

    await expect(service.findOne(2)).resolves.toEqual(method);
    expect(shipMethodRepository.findOne).toHaveBeenCalledWith({
      where: { shipMethodId: 2 },
    });
  });

  it('should throw NotFoundException when the ship method does not exist', async () => {
    shipMethodRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    await expect(service.findOne(999)).rejects.toThrow(
      'No existe el método de envío con ID 999',
    );
  });

  it('should return true if the ship method exists by id', async () => {
    shipMethodRepository.count.mockResolvedValue(1);

    await expect(service.existsById(4)).resolves.toBe(true);
    expect(shipMethodRepository.count).toHaveBeenCalledWith({
      where: { shipMethodId: 4 },
    });
  });
});
