import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [ConfigModule, DatabaseModule, JwtModule, LoggerModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
