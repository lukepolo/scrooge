import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { loggerFactory } from '../utilities/LoggerFactory';
import { PostgresModule } from '../postgres/postgres.module';
import { TransactionsController } from './transactions.controller';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [PostgresModule, AccountsModule],
  providers: [TransactionsService, loggerFactory()],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
