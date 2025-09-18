import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { loggerFactory } from '../utilities/LoggerFactory';
import { PostgresModule } from '../postgres/postgres.module';
import { AccountsController } from './accounts.controller';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [PostgresModule],
  exports: [AccountsService],
  providers: [AccountsService, TransactionsService, loggerFactory()],
  controllers: [AccountsController],
})
export class AccountsModule {}
