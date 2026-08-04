import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  Query,
  Response,
} from '@nestjs/common';
import { RevenuesService } from './revenues.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { ExportService } from '../common/services/export.service';

@Controller('api/v1/revenues')
@UseGuards(JwtAuthGuard)
export class RevenuesController {
  constructor(
    private revenuesService: RevenuesService,
    private exportService: ExportService,
  ) {}

  @Get('owner/all')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async getOwnerRevenues(@Request() req: any) {
    return this.revenuesService.getOwnerRevenues(req.user.id);
  }

  @Get('owner/total')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async getOwnerTotalRevenues(@Request() req: any) {
    const total = await this.revenuesService.getOwnerTotalRevenues(req.user.id);
    return { total };
  }

  @Get('pending')
  async getPendingRevenues(@Request() req: any) {
    return this.revenuesService.getDriverPendingRevenues(req.user.id);
  }

  @Get('my-revenues')
  async getMyRevenues(@Request() req: any) {
    return this.revenuesService.getDriverRevenues(req.user.id);
  }

  @Get('export/:vehicleId/:format')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async exportRevenues(
    @Param('vehicleId') vehicleId: string,
    @Param('format') format: 'pdf' | 'excel',
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Response() res: any,
    @Request() req: any,
  ) {
    const revenues = await this.revenuesService.getVehicleRevenues(
      vehicleId,
      req.user.id,
    );

    const start = new Date(startDate);
    const end = new Date(endDate);

    const filtered = revenues.filter((r) => {
      const rDate = new Date(r.date);
      return rDate >= start && rDate <= end;
    });

    const vehicle = await this.revenuesService.getVehicle(vehicleId);

    if (!vehicle) {
      throw new Error('Véhicule non trouvé');
    }

    const total = filtered.reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0);
    const validated = filtered
      .filter((r) => r.status === 'VALIDATED')
      .reduce((sum, r) => sum + parseFloat(r.amount.toString()), 0);

    const exportData = {
      vehiclePlate: vehicle.plate,
      startDate: start,
      endDate: end,
      items: filtered.map((r) => ({
        date: new Date(r.date).toLocaleDateString('fr-FR'),
        name: r.driver.name,
        amount: parseFloat(r.amount.toString()),
        status: r.status,
      })),
      total,
      validated,
    };

    if (format === 'pdf') {
      const pdf = await this.exportService.generatePDF(exportData);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="recettes_${vehicle.plate}_${startDate}.pdf"`,
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
        `attachment; filename="recettes_${vehicle.plate}_${startDate}.xlsx"`,
      );
      res.send(excel);
    }
  }

  @Post('vehicles/:vehicleId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async createRevenue(
    @Param('vehicleId') vehicleId: string,
    @Body('driverId') driverId: string,
    @Body('amount') amount: number,
    @Body('description') description: string,
    @Body('date') date: Date,
    @Request() req: any,
  ) {
    return this.revenuesService.createRevenue(
      vehicleId,
      driverId,
      req.user.id,
      amount,
      description,
      date,
    );
  }

  @Get('vehicles/:vehicleId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async getVehicleRevenues(
    @Param('vehicleId') vehicleId: string,
    @Query('page') page?: string,
    @Request() req?: any,
  ) {
    if (page) {
      const limit = 20;
      return this.revenuesService.getVehicleRevenuesPaginated(
        vehicleId,
        req.user.id,
        parseInt(page),
        limit,
      );
    }
    return this.revenuesService.getVehicleRevenues(vehicleId, req.user.id);
  }

  @Patch(':id/sign')
  async signRevenue(
    @Param('id') id: string,
    @Body('signature') signature: string,
    @Request() req: any,
  ) {
    const isOwner = req.user.role === Role.OWNER;
    return this.revenuesService.signRevenue(id, req.user.id, signature, isOwner);
  }

  @Patch(':id/validate')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async validateRevenue(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.revenuesService.validateRevenue(id, req.user.id);
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async rejectRevenue(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.revenuesService.rejectRevenue(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async deleteRevenue(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    await this.revenuesService.deleteRevenue(id, req.user.id);
    return { message: 'Recette supprimée avec succès' };
  }
}
