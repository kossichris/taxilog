import { IsString, Matches, MinLength, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class LoginDto {
  @Matches(/^[\d\s\-\+\(\)]{10,20}$/, {
    message: 'Phone number must be valid (10-20 digits/symbols)',
  })
  phone: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
