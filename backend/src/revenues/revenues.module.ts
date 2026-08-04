import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Revenue } from './entities/revenue.entity';
import { RevenuesService } from './revenues.service';
import { RevenuesController } from './revenues.controller';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Driver } from '../drivers/entities/driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Revenue, Vehicle, Driver])],
  providers: [RevenuesService],
  controllers: [RevenuesController],
  exports: [RevenuesService],
})
export class RevenuesModule {}
