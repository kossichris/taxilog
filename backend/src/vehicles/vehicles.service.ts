import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) {}

  async create(owner_id: string, dto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = this.vehiclesRepository.create({
      owner_id,
      ...dto,
    });
    return this.vehiclesRepository.save(vehicle);
  }

  async findAll(owner_id: string): Promise<Vehicle[]> {
    return this.vehiclesRepository.find({
      where: { owner_id, active: true },
      order: { created_at: 'DESC' },
    });
  }

  async findById(id: string, owner_id: string): Promise<Vehicle> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id, owner_id },
    });
    if (!vehicle) {
      throw new NotFoundException('Véhicule introuvable');
    }
    return vehicle;
  }

  async update(
    id: string,
    owner_id: string,
    dto: UpdateVehicleDto,
  ): Promise<Vehicle> {
    const vehicle = await this.findById(id, owner_id);
    Object.assign(vehicle, dto);
    return this.vehiclesRepository.save(vehicle);
  }

  async delete(id: string, owner_id: string): Promise<void> {
    const vehicle = await this.findById(id, owner_id);
    vehicle.active = false;
    await this.vehiclesRepository.save(vehicle);
  }
}
