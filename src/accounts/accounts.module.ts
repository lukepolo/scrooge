import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { loggerFactory } from '../utilities/LoggerFactory';
import { PostgresModule } from '../postgres/postgres.module';

@Module({   
  imports: [PostgresModule],
  providers: [AccountsService, loggerFactory()],
})
export class AccountsModule {}
