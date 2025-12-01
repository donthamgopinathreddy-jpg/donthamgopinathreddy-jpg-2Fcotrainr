import { IsEmail, IsString, MinLength, IsNumber, IsOptional, IsIn } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsString()
  @IsOptional()
  country_code?: string;

  @IsString()
  @IsOptional()
  full_name?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsIn(['client', 'trainer'])
  @IsOptional()
  role?: string;
}
