// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.supabase = createClient(
      configService.get<string>('supabase.url')!,
      configService.get<string>('supabase.anonKey')!,
    );
  }

  async register(dto: RegisterDto) {
    const { email, password } = dto;

    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return {
      message: 'User registered successfully',
      user: data.user,
    };
  }

  async signIn(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      accessToken: data.session.access_token,
      user: data.user,
    };
  }

  async signInWithGoogle(token: string) {
    // Instead of trying to sign in directly, just verify the token
    const { data, error } = await this.supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new UnauthorizedException('Google token invalid or expired');
    }

    return {
      message: 'Google login verified',
      user: data.user,
    };
  }
}
