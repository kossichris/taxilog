import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense, Vehicle])],
  providers: [ExpensesService],
  controllers: [ExpensesController],
  exports: [ExpensesService],
})
export class ExpensesModule {}
