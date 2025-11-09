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
import { JwtPayload } from '../types/user.types';

interface UpdateFields {
  phone?: string;
  email?: string;
  name?: string;
  gender?: string;
  updated_at?: Date;
}

@Injectable()
export class UsersService {
  constructor(
    private configService: ConfigService,
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async getMe(accessToken: string) {
    try {
      // Verify and decode JWT token
      const decoded = this.jwtService.verify(accessToken) as JwtPayload;
      const userId = decoded.sub;

      // Find user by ID
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
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
    } catch (error) {
      console.error('Get user error:', error);
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

      // Add updated timestamp
      updateFields.updated_at = new Date();

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
      console.error('Update user error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update profile');
    }
  }

  async getAllUsers() {
    try {
      const users = await this.databaseService.query(
        'SELECT id, email, name, phone, gender, created_at, updated_at FROM users ORDER BY created_at DESC',
      );

      return {
        message: 'Users retrieved successfully',
        data: users,
      };
    } catch (error) {
      console.error('Get all users error:', error);
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.databaseService.findOne('users', {
        id: parseInt(id),
      });

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
      console.error('Get user by ID error:', error);
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

      const newUser = await this.databaseService.insertOne('users', {
        email: dto.email.toLowerCase(),
        name: dto.name || null,
        phone: dto.phone || null,
        gender: dto.gender || null,
        role: dto.role || 'user',
        created_at: new Date(),
        updated_at: new Date(),
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
      console.error('Create user error:', error);
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

      updateFields.updated_at = new Date();

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
      console.error('Update user by ID error:', error);
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
      console.error('Delete user error:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }
}
