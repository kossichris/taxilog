import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) {}

  async createExpense(
    vehicleId: string,
    ownerId: string,
    amount: number,
    description: string,
    category: 'FUEL' | 'MAINTENANCE' | 'INSURANCE' | 'TOLL' | 'PARKING' | 'OTHER',
    date: Date,
    driverId?: string,
  ): Promise<Expense> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId, owner_id: ownerId },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    const expense = this.expensesRepository.create({
      vehicle_id: vehicleId,
      owner_id: ownerId,
      ...(driverId && { driver_id: driverId }),
      amount,
      description,
      category,
      date,
      status: 'PENDING',
      active: true,
    });

    return this.expensesRepository.save(expense);
  }

  async getVehicleExpenses(vehicleId: string, ownerId: string): Promise<Expense[]> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId, owner_id: ownerId },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    return this.expensesRepository.find({
      where: { vehicle_id: vehicleId, active: true },
      order: { date: 'DESC' },
    });
  }

  async getOwnerExpenses(ownerId: string): Promise<Expense[]> {
    return this.expensesRepository.find({
      where: { owner_id: ownerId, active: true },
      order: { date: 'DESC' },
    });
  }

  async deleteExpense(expenseId: string, ownerId: string): Promise<void> {
    const expense = await this.expensesRepository.findOne({ where: { id: expenseId } });

    if (!expense) {
      throw new NotFoundException('Dépense non trouvée');
    }

    if (expense.owner_id !== ownerId) {
      throw new BadRequestException('Vous ne pouvez pas supprimer cette dépense');
    }

    await this.expensesRepository.update(expenseId, { active: false });
  }

  async getTotalExpenses(vehicleId: string, ownerId: string): Promise<number> {
    const result = await this.expensesRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.vehicle_id = :vehicleId', { vehicleId })
      .andWhere('expense.owner_id = :ownerId', { ownerId })
      .andWhere('expense.status = :status', { status: 'VALIDATED' })
      .andWhere('expense.active = :active', { active: true })
      .getRawOne();

    return parseFloat(result?.total || 0);
  }

  async getOwnerTotalExpenses(ownerId: string): Promise<number> {
    const result = await this.expensesRepository
      .createQueryBuilder('expense')
      .select('SUM(expense.amount)', 'total')
      .where('expense.owner_id = :ownerId', { ownerId })
      .andWhere('expense.status = :status', { status: 'VALIDATED' })
      .andWhere('expense.active = :active', { active: true })
      .getRawOne();

    return parseFloat(result?.total || 0);
  }

  async signExpense(expenseId: string, userId: string, signature: string, isOwner: boolean = false): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({ where: { id: expenseId } });

    if (!expense) {
      throw new NotFoundException('Dépense non trouvée');
    }

    if (!isOwner && expense.driver_id !== userId) {
      throw new BadRequestException('Vous ne pouvez pas signer cette dépense');
    }

    if (isOwner && expense.owner_id !== userId) {
      throw new BadRequestException('Vous ne pouvez pas signer cette dépense');
    }

    if (expense.status !== 'PENDING') {
      throw new BadRequestException('Cette dépense ne peut pas être signée');
    }

    expense.status = 'SIGNED';
    expense.signature = signature;
    expense.signed_at = new Date();

    return this.expensesRepository.save(expense);
  }

  async validateExpense(expenseId: string, ownerId: string): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({ where: { id: expenseId } });

    if (!expense) {
      throw new NotFoundException('Dépense non trouvée');
    }

    if (expense.owner_id !== ownerId) {
      throw new BadRequestException('Vous ne pouvez pas valider cette dépense');
    }

    if (expense.status !== 'SIGNED') {
      throw new BadRequestException('Cette dépense ne peut pas être validée');
    }

    expense.status = 'VALIDATED';
    return this.expensesRepository.save(expense);
  }

  async rejectExpense(expenseId: string, ownerId: string): Promise<Expense> {
    const expense = await this.expensesRepository.findOne({ where: { id: expenseId } });

    if (!expense) {
      throw new NotFoundException('Dépense non trouvée');
    }

    if (expense.owner_id !== ownerId) {
      throw new BadRequestException('Vous ne pouvez pas rejeter cette dépense');
    }

    if (expense.status !== 'SIGNED') {
      throw new BadRequestException('Cette dépense ne peut pas être rejetée');
    }

    expense.status = 'PENDING';
    return this.expensesRepository.save(expense);
  }

  async getDriverPendingExpenses(driverId: string): Promise<Expense[]> {
    return this.expensesRepository.find({
      where: { driver_id: driverId, status: 'PENDING', active: true },
      order: { date: 'DESC' },
    });
  }

  async getVehicle(vehicleId: string) {
    return this.vehiclesRepository.findOne({
      where: { id: vehicleId },
    });
  }
}
