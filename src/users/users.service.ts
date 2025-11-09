import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, UserWithoutPassword } from '../types/user.types';
import * as bcrypt from 'bcrypt';
import { LoggerService } from '../common/logger/logger.service';

interface UpdateFields {
  phone?: string;
  email?: string;
  name?: string;
  gender?: string;
}

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 12; // Increased from 10 for better security

  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
    private jwtService: JwtService,
    private loggerService: LoggerService,
  ) {}

  // Helper method for consistent password hashing across the service
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async getMe(accessToken: string) {
    try {
      // Verify and decode JWT token
      const decoded = this.jwtService.verify(accessToken) as JwtPayload;
      const userId = decoded.sub;

      // Find user by ID (excluding password for security)
      const user = await this.databaseService.findOneExcluding(
        'users',
        { id: userId },
        ['password'],
      );

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        gender: user.gender,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    } catch (error) {
      this.loggerService.error(
        'Failed to get user profile',
        error,
        'UsersService.getMe',
      );
      throw new UnauthorizedException('Invalid token');
    }
  }

  async updateMe(accessToken: string, updateDto: UpdateUserDto) {
    try {
      // Verify and decode JWT token
      const decoded = this.jwtService.verify(accessToken);
      const userId = decoded.sub;

      // Find user by ID
      const user = await this.databaseService.findOne('users', { id: userId });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Prepare update fields
      const updateFields: UpdateFields = {};
      if (updateDto.email) updateFields.email = updateDto.email.toLowerCase();
      if (updateDto.phone) updateFields.phone = updateDto.phone;
      if (updateDto.name) updateFields.name = updateDto.name;
      if (updateDto.gender) updateFields.gender = updateDto.gender;

      // Note: updated_at is automatically set by database trigger

      // Update user
      const updatedUser = await this.databaseService.updateOne(
        'users',
        updateFields,
        { id: userId },
      );

      return {
        message: 'Profile updated successfully',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          phone: updatedUser.phone,
          name: updatedUser.name,
          gender: updatedUser.gender,
          created_at: updatedUser.created_at,
          updated_at: updatedUser.updated_at,
        },
      };
    } catch (error) {
      this.loggerService.error(
        'Failed to update user profile',
        error,
        'UsersService.updateMe',
      );
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  async getAllUsers(): Promise<{
    message: string;
    users: UserWithoutPassword[];
  }> {
    try {
      const users = await this.databaseService.query(
        'SELECT id, email, name, phone, gender, role, created_at, updated_at FROM users ORDER BY created_at DESC',
      );

      return {
        message: 'Users retrieved successfully',
        users: users as UserWithoutPassword[],
      };
    } catch (error) {
      this.loggerService.error(
        'Failed to retrieve all users',
        error,
        'UsersService.getAllUsers',
      );
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.databaseService.findOneExcluding(
        'users',
        { id: parseInt(id) },
        ['password'],
      );

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        message: 'User retrieved successfully',
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          gender: user.gender,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      };
    } catch (error) {
      this.loggerService.error(
        'Failed to retrieve user by ID',
        error,
        'UsersService.getUserById',
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  async createUser(dto: CreateUserDto) {
    try {
      // Check if user already exists
      const existingUser = await this.databaseService.findOne('users', {
        email: dto.email.toLowerCase(),
      });

      if (existingUser) {
        throw new UnauthorizedException('User already exists with this email');
      }

      // Ensure password is provided
      if (!dto.password) {
        throw new UnauthorizedException('Password is required');
      }

      // Hash password using helper method
      const hashedPassword = await this.hashPassword(dto.password);

      const newUser = await this.databaseService.insertOne('users', {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.name || null,
        phone: dto.phone || null,
        gender: dto.gender || null,
        role: dto.role || 'user',
        // Note: created_at and updated_at are set by database defaults/triggers
      });

      return {
        message: 'User created successfully',
        data: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone,
          gender: newUser.gender,
          role: newUser.role,
          created_at: newUser.created_at,
        },
      };
    } catch (error) {
      this.loggerService.error(
        'Failed to create user',
        error,
        'UsersService.createUser',
      );
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async updateUserById(id: string, dto: UpdateUserDto) {
    try {
      const user = await this.databaseService.findOne('users', {
        id: parseInt(id),
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const updateFields: UpdateFields = {};
      if (dto.email) updateFields.email = dto.email.toLowerCase();
      if (dto.phone) updateFields.phone = dto.phone;
      if (dto.name) updateFields.name = dto.name;
      if (dto.gender) updateFields.gender = dto.gender;

      // Note: updated_at is automatically set by database trigger

      const updatedUser = await this.databaseService.updateOne(
        'users',
        updateFields,
        { id: parseInt(id) },
      );

      return {
        message: 'User updated successfully',
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          phone: updatedUser.phone,
          gender: updatedUser.gender,
          updated_at: updatedUser.updated_at,
        },
      };
    } catch (error) {
      this.loggerService.error(
        'Failed to update user by ID',
        error,
        'UsersService.updateUserById',
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async deleteUserById(id: string) {
    try {
      const user = await this.databaseService.findOne('users', {
        id: parseInt(id),
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.databaseService.query('DELETE FROM users WHERE id = $1', [
        parseInt(id),
      ]);

      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      this.loggerService.error(
        'Failed to delete user',
        error,
        'UsersService.deleteUserById',
      );
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
