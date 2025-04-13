// src/auth/dto/register.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { IsValidPhoneWithCountry } from 'src/common/decorators/is-valid-phone.decorator';

export class RegisterDto {
  @ApiProperty({ example: 'Prakash Muduli' })
  @IsString()
  readonly name: string;

  @ApiPropertyOptional({ example: 'prakash@example.com' })
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  @IsValidPhoneWithCountry(['IN', 'US', 'GB'], {
    message: 'Phone number must be valid and from supported countries',
  })
  @IsOptional()
  readonly phone?: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6)
  readonly password: string;
}
