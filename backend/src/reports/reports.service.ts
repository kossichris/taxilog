import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Revenue } from '../revenues/entities/revenue.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

interface MonthlyData {
  month: string;
  revenues: number;
  expenses: number;
  profit: number;
}

interface ReportData {
  ownerName: string;
  generatedAt: string;
  totalRevenues: number;
  totalExpenses: number;
  totalProfit: number;
  monthlyData: MonthlyData[];
  items: Array<{
    type: 'revenue' | 'expense';
    date: string;
    vehicle: string;
    description: string;
    amount: number;
    status: string;
  }>;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Revenue)
    private revenuesRepository: Repository<Revenue>,
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
  ) {}

  async generateVehicleReport(vehicleId: string, ownerId: string): Promise<ReportData> {
    const vehicle = await this.vehiclesRepository.findOne({
      where: { id: vehicleId, owner_id: ownerId, active: true },
    });

    if (!vehicle) {
      throw new NotFoundException('Véhicule non trouvé');
    }

    const revenues = await this.revenuesRepository.find({
      where: { vehicle_id: vehicleId, owner_id: ownerId, active: true },
      relations: ['vehicle', 'driver'],
      order: { date: 'DESC' },
    });

    const expenses = await this.expensesRepository.find({
      where: { vehicle_id: vehicleId, owner_id: ownerId, active: true },
      relations: ['vehicle'],
      order: { date: 'DESC' },
    });

    const totalRevenues = revenues.reduce(
      (sum, r) => sum + parseFloat(r.amount.toString()),
      0,
    );
    const totalExpenses = expenses.reduce(
      (sum, e) => sum + parseFloat(e.amount.toString()),
      0,
    );
    const totalProfit = totalRevenues - totalExpenses;

    const items: ReportData['items'] = [
      ...revenues.map((r) => ({
        type: 'revenue' as const,
        date: new Date(r.date).toLocaleDateString('fr-FR'),
        vehicle: r.vehicle.plate,
        description: r.description || r.driver.name,
        amount: parseFloat(r.amount.toString()),
        status: r.status,
      })),
      ...expenses.map((e) => ({
        type: 'expense' as const,
        date: new Date(e.date).toLocaleDateString('fr-FR'),
        vehicle: e.vehicle.plate,
        description: e.description || e.category,
        amount: parseFloat(e.amount.toString()),
        status: e.status,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      ownerName: `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}`,
      generatedAt: new Date().toLocaleDateString('fr-FR'),
      totalRevenues,
      totalExpenses,
      totalProfit,
      monthlyData: [],
      items,
    };
  }

  async generateOwnerReport(ownerId: string): Promise<ReportData> {
    const vehicles = await this.vehiclesRepository.find({
      where: { owner_id: ownerId, active: true },
    });

    if (vehicles.length === 0) {
      throw new NotFoundException('Pas de véhicules trouvés');
    }

    const vehicleIds = vehicles.map((v) => v.id);

    const revenues = await this.revenuesRepository.find({
      where: {
        owner_id: ownerId,
        active: true,
        vehicle_id: undefined,
      },
      relations: ['vehicle', 'driver'],
    });

    const expenses = await this.expensesRepository.find({
      where: {
        owner_id: ownerId,
        active: true,
        vehicle_id: undefined,
      },
      relations: ['vehicle'],
    });

    // Get all revenues and expenses regardless of status
    const allRevenues = await this.revenuesRepository.find({
      where: { owner_id: ownerId, active: true },
      relations: ['vehicle', 'driver'],
    });

    const allExpenses = await this.expensesRepository.find({
      where: { owner_id: ownerId, active: true },
      relations: ['vehicle'],
    });

    // Calculate totals
    const totalRevenues = allRevenues.reduce(
      (sum, r) => sum + parseFloat(r.amount.toString()),
      0,
    );
    const totalExpenses = allExpenses.reduce(
      (sum, e) => sum + parseFloat(e.amount.toString()),
      0,
    );
    const totalProfit = totalRevenues - totalExpenses;

    // Group by month
    const monthlyMap = new Map<string, MonthlyData>();

    allRevenues.forEach((r) => {
      const date = new Date(r.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          revenues: 0,
          expenses: 0,
          profit: 0,
        });
      }

      const monthData = monthlyMap.get(monthKey)!;
      monthData.revenues += parseFloat(r.amount.toString());
      monthData.profit = monthData.revenues - monthData.expenses;
    });

    allExpenses.forEach((e) => {
      const date = new Date(e.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          revenues: 0,
          expenses: 0,
          profit: 0,
        });
      }

      const monthData = monthlyMap.get(monthKey)!;
      monthData.expenses += parseFloat(e.amount.toString());
      monthData.profit = monthData.revenues - monthData.expenses;
    });

    const monthlyData = Array.from(monthlyMap.values()).sort(
      (a, b) => a.month.localeCompare(b.month),
    );

    // Combine items
    const items: ReportData['items'] = [
      ...allRevenues.map((r) => ({
        type: 'revenue' as const,
        date: new Date(r.date).toLocaleDateString('fr-FR'),
        vehicle: r.vehicle.plate,
        description: r.description || r.driver.name,
        amount: parseFloat(r.amount.toString()),
        status: r.status,
      })),
      ...allExpenses.map((e) => ({
        type: 'expense' as const,
        date: new Date(e.date).toLocaleDateString('fr-FR'),
        vehicle: e.vehicle.plate,
        description: e.description || e.category,
        amount: parseFloat(e.amount.toString()),
        status: e.status,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      ownerName: 'Rapport TaxiLog',
      generatedAt: new Date().toLocaleDateString('fr-FR'),
      totalRevenues,
      totalExpenses,
      totalProfit,
      monthlyData,
      items,
    };
  }
}
