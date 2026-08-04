import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('api/v1/expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post('vehicles/:vehicleId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async createExpense(
    @Param('vehicleId') vehicleId: string,
    @Body('amount') amount: number,
    @Body('description') description: string,
    @Body('category') category: 'FUEL' | 'MAINTENANCE' | 'INSURANCE' | 'TOLL' | 'PARKING' | 'OTHER',
    @Body('date') date: Date,
    @Request() req: any,
  ) {
    return this.expensesService.createExpense(
      vehicleId,
      req.user.id,
      amount,
      description,
      category,
      date,
    );
  }

  @Get('vehicles/:vehicleId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async getVehicleExpenses(
    @Param('vehicleId') vehicleId: string,
    @Request() req: any,
  ) {
    return this.expensesService.getVehicleExpenses(vehicleId, req.user.id);
  }

  @Get('owner/all')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async getOwnerExpenses(@Request() req: any) {
    return this.expensesService.getOwnerExpenses(req.user.id);
  }

  @Get('owner/total')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async getOwnerTotalExpenses(@Request() req: any) {
    const total = await this.expensesService.getOwnerTotalExpenses(req.user.id);
    return { total };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async deleteExpense(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    await this.expensesService.deleteExpense(id, req.user.id);
    return { message: 'Dépense supprimée avec succès' };
  }
}
