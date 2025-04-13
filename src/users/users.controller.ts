import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  Request,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@Headers('authorization') authHeader: string) {
    const accessToken = authHeader?.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('Authorization token not found');
    }
    return this.usersService.getMe(accessToken);
  }

  @Put('me')
  updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    return this.usersService.updateMe(req.user, dto);
  }
}
