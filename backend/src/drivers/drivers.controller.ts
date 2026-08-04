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
import { DriversService } from './drivers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('api/v1/drivers')
@UseGuards(JwtAuthGuard)
export class DriversController {
  constructor(private driversService: DriversService) {}

  @Post('vehicles/:vehicleId/add')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async addDriver(
    @Param('vehicleId') vehicleId: string,
    @Body('phone') phone: string,
    @Request() req: any,
  ) {
    return this.driversService.addDriverToVehicle(vehicleId, phone, req.user.id);
  }

  @Get('vehicles/:vehicleId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async getVehicleDrivers(
    @Param('vehicleId') vehicleId: string,
    @Request() req: any,
  ) {
    return this.driversService.getVehicleDrivers(vehicleId, req.user.id);
  }

  @Delete('vehicles/:vehicleId/:driverId')
  @UseGuards(RolesGuard)
  @Roles(Role.OWNER)
  async removeDriver(
    @Param('vehicleId') vehicleId: string,
    @Param('driverId') driverId: string,
    @Request() req: any,
  ) {
    await this.driversService.removeDriver(vehicleId, driverId, req.user.id);
    return { message: 'Driver supprimé avec succès' };
  }

  @Get('my-vehicles')
  async getMyVehicles(@Request() req: any) {
    return this.driversService.getDriverVehicles(req.user.id);
  }
}
