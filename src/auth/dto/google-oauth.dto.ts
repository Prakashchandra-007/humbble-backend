import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleOAuthDto {
  @ApiProperty({
    description: 'Google access token obtained from Google OAuth flow',
    example: 'ya29.a0AfH6SMC...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}
