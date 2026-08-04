import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  color?: string;
}
