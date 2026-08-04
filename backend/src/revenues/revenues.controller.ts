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
} from '@nestjs/common';
import { RevenuesService } from './revenues.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('api/v1/revenues')
@UseGuards(JwtAuthGuard)
export class RevenuesController {
  constructor(private revenuesService: RevenuesService) {}

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

  @Get('vehicles/:vehicleId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async getVehicleRevenues(
    @Param('vehicleId') vehicleId: string,
    @Request() req: any,
  ) {
    return this.revenuesService.getVehicleRevenues(vehicleId, req.user.id);
  }

  @Get('pending')
  async getPendingRevenues(@Request() req: any) {
    return this.revenuesService.getDriverPendingRevenues(req.user.id);
  }

  @Get('my-revenues')
  async getMyRevenues(@Request() req: any) {
    return this.revenuesService.getDriverRevenues(req.user.id);
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
