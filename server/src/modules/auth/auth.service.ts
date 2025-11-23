import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SupabaseService } from '../../common/supabase/supabase.service';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService
  ) {}

  async signup(signupDto: SignupDto) {
    // Check if user already exists
    const existingUser = await this.supabaseService.getUserByEmail(signupDto.email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(signupDto.password, 10);

    // Create user
    const user = await this.supabaseService.createUser({
      email: signupDto.email,
      username: signupDto.username,
      password_hash: passwordHash,
      role: signupDto.role || 'client',
      height_cm: signupDto.height,
      weight_kg: signupDto.weight,
    });

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        height: user.height_cm,
        weight: user.weight_kg,
        bmi: user.bmi,
      },
      token,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.supabaseService.getUserByEmail(email);
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) return null;

    return user;
  }

  async login(user: any) {
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        height: user.height_cm,
        weight: user.weight_kg,
        bmi: user.bmi,
        subscription_plan: user.subscription_plan,
        coins_balance: user.coins_balance,
        verified_trainer: user.verified_trainer,
      },
      token,
    };
  }
}
