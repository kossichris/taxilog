import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Driver } from './entities/driver.entity';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private driversRepository: Repository<Driver>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) {}

  async addDriverToVehicle(
    vehicleId: string,
    phoneOrUserId: string,
    ownerId: string,
  ): Promise<Driver> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId, owner_id: ownerId },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    let user = await this.usersRepository.findOne({
      where: { phone: phoneOrUserId },
    });

    if (!user) {
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      user = this.usersRepository.create({
        phone: phoneOrUserId,
        password_hash: hashedPassword,
        name: phoneOrUserId,
        role: Role.DRIVER,
      });
      user = await this.usersRepository.save(user);
    }

    const existingDriver = await this.driversRepository.findOne({
      where: { user_id: user.id, vehicle_id: vehicleId },
    });

    if (existingDriver) {
      throw new BadRequestException('Ce driver est déjà assigné à ce véhicule');
    }

    const driver = this.driversRepository.create({
      user_id: user.id,
      vehicle_id: vehicleId,
      role: 'DRIVER',
      active: true,
    });

    return this.driversRepository.save(driver);
  }

  async getVehicleDrivers(vehicleId: string, ownerId: string): Promise<Driver[]> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId, owner_id: ownerId },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    return this.driversRepository.find({
      where: { vehicle_id: vehicleId, active: true },
    });
  }

  async removeDriver(vehicleId: string, driverId: string, ownerId: string): Promise<void> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId, owner_id: ownerId },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    const driver = await this.driversRepository.findOne({
      where: { id: driverId, vehicle_id: vehicleId },
    });

    if (!driver) {
      throw new NotFoundException('Driver non trouvé');
    }

    await this.driversRepository.update(driverId, { active: false });
  }

  async getDriverVehicles(userId: string): Promise<Driver[]> {
    return this.driversRepository.find({
      where: { user_id: userId, active: true },
    });
  }
}
