// src/auth/auth.controller.ts
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleOAuthDto } from './dto/google-oauth.dto';
import { ApiBody, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PublicGuard } from 'src/common/guards/public.guard';

@ApiTags('Auth') // Groups under "Auth" in Swagger UI
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Sign in with credentials' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto);
  }

  @Post('oauth/google')
  @ApiOperation({ summary: 'Sign in with Google OAuth' })
  @ApiBody({ type: GoogleOAuthDto })
  @ApiResponse({
    status: 200,
    description: 'Google OAuth successful',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            full_name: { type: 'string' },
            phone_number: { type: 'string' },
          },
        },
        accessToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid Google token or Google OAuth disabled',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error during OAuth',
  })
  async googleOAuth(@Body() googleOAuthDto: GoogleOAuthDto) {
    return this.authService.signInWithGoogle(googleOAuthDto.token);
  }

  @UseGuards(PublicGuard) // Optional: allows public access if guard is implemented
  @Post('register')
  @ApiOperation({ summary: 'Register new user account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid registration data or user already exists',
  })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
