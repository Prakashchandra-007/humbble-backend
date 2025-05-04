import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'proking.p@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '9853747944' })
  @IsString()
  @MinLength(6)
  password: string;
}
