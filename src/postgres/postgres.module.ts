import { Module } from '@nestjs/common';
import { PostgresService } from './postgres.service';
import { loggerFactory } from '../utilities/LoggerFactory';

@Module({
  exports: [PostgresService],
  providers: [PostgresService, loggerFactory()],
})
export class PostgresModule {}
