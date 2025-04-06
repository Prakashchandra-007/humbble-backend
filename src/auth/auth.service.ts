import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private supabase;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.supabase = createClient(
      configService.get<string>('supabase.url')!,
      configService.get<string>('supabase.anonKey')!,
    );
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
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { accessToken: token },
    });

    if (error) throw new UnauthorizedException('Google login failed');
    return data;
  }
}
