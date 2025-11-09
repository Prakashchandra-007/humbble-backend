import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({
    example: 'user',
    description: 'User role: admin or user',
    enum: ['admin', 'user'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['admin', 'user'])
  role?: string;
}
