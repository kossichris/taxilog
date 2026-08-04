import { IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @MinLength(5)
  @MaxLength(20)
  @Matches(/^[A-Z0-9\-]+$/, {
    message: 'Immatriculation doit contenir lettres majuscules, chiffres et tirets uniquement',
  })
  plate: string;

  @IsString()
  @MaxLength(50)
  brand: string;

  @IsString()
  @MaxLength(50)
  model: string;

  @IsString()
  @MaxLength(30)
  color: string;
}
