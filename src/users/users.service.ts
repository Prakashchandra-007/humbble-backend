import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
interface UpdateFields {
  phone?: string;
  email?: string;
}
interface MetaData {
  name?: string;
  gender?: string;
}
@Injectable()
export class UsersService {
  private supabase;
  private adminClient;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      configService.get<string>('supabase.url')!,
      configService.get<string>('supabase.anonKey')!,
    );

    // Create an admin client with Service Role Key (DO NOT expose to frontend)
    this.adminClient = createClient(
      configService.get<string>('supabase.url')!,
      configService.get<string>('supabase.serviceRoleKey')!,
    );
  }

  async getMe(accessToken: string) {
    const { data, error } = await this.supabase.auth.getUser(accessToken);
    if (error || !data.user) throw new UnauthorizedException('Invalid token');
    return data.user;
  }

  async updateMe(accessToken: string, updateDto: UpdateUserDto) {
    const { data: userData, error: userError } =
      await this.supabase.auth.getUser(accessToken);

    if (userError || !userData.user)
      throw new UnauthorizedException('Invalid token');

    const updateFields: UpdateFields = {};
    if (updateDto.email) updateFields.email = updateDto.email;
    if (updateDto.phone) updateFields.phone = updateDto.phone;

    const userMetadata: Record<string, any> = {};
    if (updateDto.name) userMetadata.name = updateDto.name;
    if (updateDto.gender) userMetadata.gender = updateDto.gender;

    const { data, error } = await this.supabase.auth.updateUser(
      {
        email: updateFields.email,
        phone: updateFields.phone,
        data: userMetadata,
      },
      { token: accessToken },
    );

    if (error) throw new InternalServerErrorException(error.message);

    return {
      message: 'Profile updated successfully',
      data: {
        id: data.user.id,
        email: data.user.email,
        phone: data.user.phone,
        name: data.user.user_metadata?.name,
        gender: data.user.user_metadata?.gender,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at,
      },
    };
  }

  async getAllUsers() {
    const { data, error } = await this.adminClient.auth.admin.listUsers();

    if (error) {
      throw new InternalServerErrorException(
        'Failed to fetch users: ' + error.message,
      );
    }
    return data.users.map((user) => ({
      id: user.id,
      email: user.email,
      phone: user.phone,
      name: user.user_metadata?.name,
      gender: user.user_metadata?.gender,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }));
  }
  async getUserById(id: string) {
    const { data, error } = await this.adminClient.auth.admin.getUserById(id);

    if (error || !data.user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: data.user.id,
      email: data.user.email,
      phone: data.user.phone,
      name: data.user.user_metadata?.name,
      gender: data.user.user_metadata?.gender,
      created_at: data.user.created_at,
      updated_at: data.user.updated_at,
    };
  }
  async createUser(dto: CreateUserDto) {
    const { data, error } = await this.supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          name: dto.name,
          phone: dto.phone,
        },
      },
    });

    if (error) throw new InternalServerErrorException(error.message);
    return data.user;
  }

  async updateUserById(id: string, dto: UpdateUserDto) {
    const updateFields: UpdateFields = {};
    if (dto.email) updateFields.email = dto.email;
    if (dto.phone) updateFields.phone = dto.phone;

    const metadata: MetaData = {};
    if (dto.name) metadata.name = dto.name;
    if (dto.gender) metadata.gender = dto.gender;

    const { data, error } = await this.adminClient.auth.admin.updateUserById(
      id,
      {
        email: updateFields.email,
        phone: updateFields.phone,
        user_metadata: metadata,
      },
    );

    if (error) throw new InternalServerErrorException(error.message);
    return {
      message: 'Profile updated successfully',
      data: {
        id: data.user.id,
        email: data.user.email,
        phone: data.user.phone,
        name: data.user.user_metadata?.name,
        gender: data.user.user_metadata?.gender,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at,
      },
    };
  }

  async deleteUserById(id: string) {
    const { data, error } = await this.adminClient.auth.admin.deleteUser(id);
    if (error) throw new InternalServerErrorException(error.message);
    return { message: 'User deleted successfully', data };
  }
}
