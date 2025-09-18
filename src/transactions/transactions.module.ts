import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { loggerFactory } from '../utilities/LoggerFactory';
import { PostgresModule } from '../postgres/postgres.module';

@Module({
  imports: [PostgresModule],
  providers: [TransactionsService, loggerFactory()],
})
export class TransactionsModule {}
