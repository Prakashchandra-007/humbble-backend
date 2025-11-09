// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload, User, UserWithoutPassword } from '../types/user.types';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private databaseService: DatabaseService,
  ) {}

  async register(dto: RegisterDto) {
    const { email, password, name, phone, role } = dto;

    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    // Check if user already exists
    const existingUser = await this.databaseService.findOne('users', {
      email: email.toLowerCase(),
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists with this email');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    try {
      // Create new user with role (defaults to 'user' if not specified)
      const newUser = await this.databaseService.insertOne('users', {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
        phone: phone || null,
        role: role || 'user',
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Generate JWT token with role
      const payload = {
        sub: newUser.id,
        email: newUser.email,
        user_metadata: { role: newUser.role },
      };
      const accessToken = this.jwtService.sign(payload);

      return {
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
          created_at: newUser.created_at,
        },
        accessToken,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new UnauthorizedException('Registration failed');
    }
  }

  async signIn(loginDto: LoginDto) {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    // Find user by email
    const user = await this.databaseService.findOne('users', {
      email: email.toLowerCase(),
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token with role
    const payload = {
      sub: user.id,
      email: user.email,
      user_metadata: { role: user.role },
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        role: user.role,
        created_at: user.created_at,
      },
    };
  }

  async signInWithGoogle(token: string) {
    // For now, just validate that a token was provided
    // In a real implementation, you would verify the Google token
    if (!token) {
      throw new UnauthorizedException('Google token is required');
    }

    // TODO: Implement Google OAuth token verification
    // This would typically involve verifying the token with Google's servers
    // and then either creating a new user or returning an existing one

    throw new UnauthorizedException('Google OAuth not implemented yet');
  }

  async validateUser(userId: number) {
    const user = await this.databaseService.findOne('users', { id: userId });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      gender: user.gender,
    };
  }
}
