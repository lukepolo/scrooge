import { Module } from '@nestjs/common';
import { LoansService } from './loans.service';
import { loggerFactory } from '../utilities/LoggerFactory';
import { PostgresModule } from '../postgres/postgres.module';
import { LoansController } from './loans.controller';

@Module({
  imports: [PostgresModule],
  providers: [LoansService, loggerFactory()],
  controllers: [LoansController],
})
export class LoansModule {}
