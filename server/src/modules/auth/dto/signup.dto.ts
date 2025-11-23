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

  @IsIn(['client', 'trainer'])
  @IsOptional()
  role?: string;
}
