import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Revenue } from './entities/revenue.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';

@Injectable()
export class RevenuesService {
  constructor(
    @InjectRepository(Revenue)
    private revenuesRepository: Repository<Revenue>,
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(Driver)
    private driversRepository: Repository<Driver>,
  ) {}

  async createRevenue(
    vehicleId: string,
    driverId: string,
    ownerId: string,
    amount: number,
    description: string,
    date: Date,
  ): Promise<Revenue> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId, owner_id: ownerId },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    const driver = await this.driversRepository.findOne({
      where: { id: driverId, vehicle_id: vehicleId, active: true },
    });

    if (!driver) {
      throw new BadRequestException('Driver non assigné à ce véhicule');
    }

    const revenue = this.revenuesRepository.create({
      vehicle_id: vehicleId,
      driver_id: driver.user_id,
      owner_id: ownerId,
      amount,
      description,
      date,
      status: 'PENDING',
      active: true,
    });

    return this.revenuesRepository.save(revenue);
  }

  async getVehicleRevenues(vehicleId: string, ownerId: string): Promise<Revenue[]> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId, owner_id: ownerId },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    return this.revenuesRepository.find({
      where: { vehicle_id: vehicleId, active: true },
      order: { date: 'DESC' },
    });
  }

  async getDriverPendingRevenues(driverId: string): Promise<Revenue[]> {
    return this.revenuesRepository.find({
      where: { driver_id: driverId, status: 'PENDING', active: true },
      order: { date: 'DESC' },
    });
  }

  async getDriverRevenues(driverId: string): Promise<Revenue[]> {
    return this.revenuesRepository.find({
      where: { driver_id: driverId, active: true },
      order: { date: 'DESC' },
    });
  }

  async signRevenue(revenueId: string, userId: string, signature: string, isOwner: boolean = false): Promise<Revenue> {
    const revenue = await this.revenuesRepository.findOne({ where: { id: revenueId } });

    if (!revenue) {
      throw new NotFoundException('Recette non trouvée');
    }

    if (!isOwner && revenue.driver_id !== userId) {
      throw new BadRequestException('Vous ne pouvez pas signer cette recette');
    }

    if (isOwner && revenue.owner_id !== userId) {
      throw new BadRequestException('Vous ne pouvez pas signer cette recette');
    }

    if (revenue.status !== 'PENDING') {
      throw new BadRequestException('Cette recette ne peut pas être signée');
    }

    revenue.status = 'SIGNED';
    revenue.signature = signature;
    revenue.signed_at = new Date();

    return this.revenuesRepository.save(revenue);
  }

  async validateRevenue(revenueId: string, ownerId: string): Promise<Revenue> {
    const revenue = await this.revenuesRepository.findOne({ where: { id: revenueId } });

    if (!revenue) {
      throw new NotFoundException('Recette non trouvée');
    }

    if (revenue.owner_id !== ownerId) {
      throw new BadRequestException('Vous ne pouvez pas valider cette recette');
    }

    if (revenue.status !== 'SIGNED') {
      throw new BadRequestException('Cette recette ne peut pas être validée');
    }

    revenue.status = 'VALIDATED';
    return this.revenuesRepository.save(revenue);
  }

  async deleteRevenue(revenueId: string, ownerId: string): Promise<void> {
    const revenue = await this.revenuesRepository.findOne({ where: { id: revenueId } });

    if (!revenue) {
      throw new NotFoundException('Recette non trouvée');
    }

    if (revenue.owner_id !== ownerId) {
      throw new BadRequestException('Vous ne pouvez pas supprimer cette recette');
    }

    await this.revenuesRepository.update(revenueId, { active: false });
  }

  async getTotalRevenues(vehicleId: string, ownerId: string): Promise<number> {
    const result = await this.revenuesRepository
      .createQueryBuilder('revenue')
      .select('SUM(revenue.amount)', 'total')
      .where('revenue.vehicle_id = :vehicleId', { vehicleId })
      .andWhere('revenue.owner_id = :ownerId', { ownerId })
      .andWhere('revenue.status = :status', { status: 'VALIDATED' })
      .andWhere('revenue.active = :active', { active: true })
      .getRawOne();

    return parseFloat(result?.total || 0);
  }

  async getOwnerRevenues(ownerId: string): Promise<Revenue[]> {
    return this.revenuesRepository.find({
      where: { owner_id: ownerId, active: true },
      order: { date: 'DESC' },
    });
  }

  async getOwnerTotalRevenues(ownerId: string): Promise<number> {
    const result = await this.revenuesRepository
      .createQueryBuilder('revenue')
      .select('SUM(revenue.amount)', 'total')
      .where('revenue.owner_id = :ownerId', { ownerId })
      .andWhere('revenue.active = :active', { active: true })
      .getRawOne();

    return parseFloat(result?.total || 0);
  }
}
