import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { User } from '../users/entities/user.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, User, Vehicle])],
  providers: [DriversService],
  controllers: [DriversController],
  exports: [DriversService],
})
export class DriversModule {}
