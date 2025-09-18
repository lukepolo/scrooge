import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { loggerFactory } from '../utilities/LoggerFactory';
import { PostgresModule } from '../postgres/postgres.module';
import { AccountsController } from './accounts.controller';

@Module({
  imports: [PostgresModule],
  providers: [AccountsService, loggerFactory()],
  controllers: [AccountsController],
})
export class AccountsModule {}
