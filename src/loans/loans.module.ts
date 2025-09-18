import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { loggerFactory } from '../utilities/LoggerFactory';
import { PostgresModule } from '../postgres/postgres.module';

@Module({
  imports: [PostgresModule],
  providers: [LoansService, loggerFactory()],
})
export class LoansModule {}
