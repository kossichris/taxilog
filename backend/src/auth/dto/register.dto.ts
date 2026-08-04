import { IsString, Matches, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @Matches(/^[\d\s\-\+\(\)]{10,20}$/, {
    message: 'Phone number must be valid (10-20 digits/symbols)',
  })
  phone: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(50)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}
