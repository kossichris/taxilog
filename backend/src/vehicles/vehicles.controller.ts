import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('api/v1/vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER)
@UseFilters(HttpExceptionFilter)
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Get()
  async getMyVehicles(@CurrentUser() user: JwtPayload) {
    return this.vehiclesService.findAll(user.sub);
  }

  @Post()
  async createVehicle(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.vehiclesService.create(user.sub, dto);
  }

  @Get(':id')
  async getVehicle(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    return this.vehiclesService.findById(id, user.sub);
  }

  @Patch(':id')
  async updateVehicle(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, user.sub, dto);
  }

  @Delete(':id')
  async deleteVehicle(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ) {
    await this.vehiclesService.delete(id, user.sub);
    return { message: 'Véhicule désactivé' };
  }
}
