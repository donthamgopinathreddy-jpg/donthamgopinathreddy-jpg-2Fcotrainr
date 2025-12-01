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
      phone_number: signupDto.phone_number,
      country_code: signupDto.country_code,
      full_name: signupDto.full_name,
      gender: signupDto.gender,
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
        full_name: user.full_name,
        role: user.role,
        height: user.height_cm,
        weight: user.weight_kg,
        phone_number: user.phone_number,
        country_code: user.country_code,
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

  async resetPassword(email: string, method: 'email' | 'phone') {
    const user = await this.supabaseService.getUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists (security best practice)
      return {
        success: true,
        message: 'If an account exists with this email, a password reset link will be sent.',
      };
    }

    try {
      // Generate a temporary reset token
      const resetToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          type: 'password-reset',
        },
        { expiresIn: '1h' }
      );

      // In a real application, you would:
      // 1. Send an email with a reset link containing the token
      // 2. Send an SMS with a reset code (for phone method)
      // 3. Store the token in a database with expiration

      // For now, we'll just return success
      console.log(`[Auth] Password reset requested for ${email} via ${method}`);
      console.log(`[Auth] Reset token: ${resetToken.substring(0, 20)}...`);

      if (method === 'email') {
        // TODO: Send email with reset link
        console.log(`[Auth] Would send reset email to: ${user.email}`);
      } else if (method === 'phone') {
        // TODO: Send SMS with reset code
        console.log(`[Auth] Would send reset SMS to: ${user.phone_number}`);
      }

      return {
        success: true,
        message: `Password reset link will be sent to ${method === 'email' ? user.email : user.phone_number}`,
      };
    } catch (error) {
      console.error('[Auth] Error in password reset:', error);
      throw new BadRequestException('Failed to process password reset request');
    }
  }
}
