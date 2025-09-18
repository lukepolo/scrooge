import { Module } from '@nestjs/common';
import { PostgresModule } from './postgres/postgres.module';
import { ConfigModule } from '@nestjs/config';
import configs from './configs';
import { loggerFactory } from './utilities/LoggerFactory';
import { AccountsModule } from './accounts/accounts.module';
import { LoansModule } from './loans/loans.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
    }),
    PostgresModule,
    AccountsModule,
    LoansModule,
    TransactionsModule,
  ],
  providers: [loggerFactory()],
  controllers: [],
})
export class AppModule {}
