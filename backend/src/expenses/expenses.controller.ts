import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  Response,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ExportService } from '../common/services/export.service';

@Controller('api/v1/expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(
    private expensesService: ExpensesService,
    private exportService: ExportService,
  ) {}

  @Post('vehicles/:vehicleId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async createExpense(
    @Param('vehicleId') vehicleId: string,
    @Body('amount') amount: number,
    @Body('description') description: string,
    @Body('category') category: 'FUEL' | 'MAINTENANCE' | 'INSURANCE' | 'TOLL' | 'PARKING' | 'OTHER',
    @Body('date') date: Date,
    @Body('driverId') driverId: string,
    @Request() req: any,
  ) {
    return this.expensesService.createExpense(
      vehicleId,
      req.user.id,
      amount,
      description,
      category,
      date,
      driverId,
    );
  }

  @Get('vehicles/:vehicleId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async getVehicleExpenses(
    @Param('vehicleId') vehicleId: string,
    @Query('page') page?: string,
    @Request() req?: any,
  ) {
    if (page) {
      const limit = 20;
      return this.expensesService.getVehicleExpensesPaginated(
        vehicleId,
        req.user.id,
        parseInt(page),
        limit,
      );
    }
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

  @Post(':id/sign')
  async signExpense(
    @Param('id') id: string,
    @Body('signature') signature: string,
    @Request() req: any,
  ) {
    const isOwner = req.user.role === Role.OWNER;
    return this.expensesService.signExpense(id, req.user.id, signature, isOwner);
  }

  @Post(':id/validate')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async validateExpense(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.expensesService.validateExpense(id, req.user.id);
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async rejectExpense(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.expensesService.rejectExpense(id, req.user.id);
  }

  @Get('driver/pending')
  @UseGuards(RolesGuard)
  @Roles(Role.DRIVER)
  async getDriverPendingExpenses(@Request() req: any) {
    return this.expensesService.getDriverPendingExpenses(req.user.id);
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

  @Get('export/:vehicleId/:format')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async exportExpenses(
    @Param('vehicleId') vehicleId: string,
    @Param('format') format: 'pdf' | 'excel',
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Response() res: any,
    @Request() req: any,
  ) {
    const expenses = await this.expensesService.getVehicleExpenses(
      vehicleId,
      req.user.id,
    );

    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = expenses.filter((e) => {
      const eDate = new Date(e.date);
      return eDate >= start && eDate <= end;
    });

    const vehicle = await this.expensesService.getVehicle(vehicleId);

    if (!vehicle) {
      throw new Error('Véhicule non trouvé');
    }

    const total = filtered.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);
    const validated = filtered
      .filter((e) => e.status === 'VALIDATED')
      .reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);

    const exportData = {
      vehiclePlate: vehicle.plate,
      startDate: start,
      endDate: end,
      items: filtered.map((e) => ({
        date: new Date(e.date).toLocaleDateString('fr-FR'),
        name: `${e.category}`,
        amount: parseFloat(e.amount.toString()),
        status: e.status,
      })),
      total,
      validated,
    };

    if (format === 'pdf') {
      const pdf = await this.exportService.generatePDF(exportData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="depenses_${vehicle.plate}_${startDate}.pdf"`,
      );
      res.send(pdf);
    } else {
      const excel = await this.exportService.generateExcel(exportData);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="depenses_${vehicle.plate}_${startDate}.xlsx"`,
      );
      res.send(excel);
    }
  }
}
