import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      configService.get<string>('supabase.url')!,
      configService.get<string>('supabase.anonKey')!,
    );
  }

  async getMe(accessToken: string) {
    const { data, error } = await this.supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new UnauthorizedException('Invalid token');
    }

    return data.user;
  }

  async updateMe(accessToken: string, updateDto: UpdateUserDto) {
    const { data: userData, error: userError } =
      await this.supabase.auth.getUser(accessToken);

    if (userError || !userData.user) {
      throw new UnauthorizedException('Invalid token');
    }

    const { user } = userData;

    const { data, error } = await this.supabase.auth.updateUser(
      { data: updateDto },
      { token: accessToken },
    );

    if (error) throw new Error(error.message);

    return {
      message: 'Profile updated successfully',
      user: data.user,
    };
  }
}
