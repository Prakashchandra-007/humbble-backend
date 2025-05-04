import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get all users (only accessible by authenticated users)
   * @returns List of users
   */
  @Get()
  @ApiOperation({ summary: 'Retrieve all users' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all users.',
  })
  getAllUsers(@Request() req) {
    return this.usersService.getAllUsers();
  }

  /**
   * Get a single user by ID
   * @param id User ID
   * @returns User data
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the user.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  getUserById(@Param('id') id: string) {
    return this.usersService.getUserById(id);
  }

  /**
   * Create a new user
   * @param dto User data for creation
   * @returns Newly created user data
   */
  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created.',
  })
  createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  /**
   * Update user data by ID
   * @param id User ID
   * @param dto Data for updating the user
   * @returns Updated user data
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully updated the user.',
  })
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUserById(id, dto);
  }

  /**
   * Delete user by ID
   * @param id User ID
   * @returns Confirmation message
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted the user.',
  })
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUserById(id);
  }
}
