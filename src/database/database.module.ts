import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from './database.service';
import databaseConfig from '../config/configuration';
import { LoggerModule } from '../common/logger/logger.module';

@Module({
  imports: [ConfigModule.forFeature(databaseConfig), LoggerModule],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
