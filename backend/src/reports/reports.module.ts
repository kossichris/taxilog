import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Revenue } from '../revenues/entities/revenue.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ExportService } from '../common/services/export.service';

@Module({
  imports: [TypeOrmModule.forFeature([Revenue, Expense, Vehicle])],
  providers: [ReportsService, ExportService],
  controllers: [ReportsController],
  exports: [ReportsService],
})
export class ReportsModule {}
