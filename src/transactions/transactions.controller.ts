import { Controller, Post, Body, Param, Logger } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('/accounts/:accountId/transactions')
export class TransactionsController {
  constructor(
    private readonly logger: Logger,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post('despoit')
  public async despoit(
    @Body('userId') userId: string,
    @Body('amount') amount: number,
    @Param('accountId') accountId: string,
  ): Promise<{ error?: string; balance?: number }> {
    try {
      if (!amount) {
        // TODO - add validation service
        return { error: 'amount is required' };
      }
      return await this.transactionsService.despoit(userId, accountId, amount);
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }
    
      this.logger.error(`unknown error`, error as Error);

      return { error: 'internal server error' };
    }
  }

  @Post('withdraw')
  public async withdraw(
    @Body('userId') userId: string,
    @Body('amount') amount: number,
    @Param('accountId') accountId: string,
  ): Promise<{ error?: string; balance?: number }> {
    try {
      if (!amount) {
        // TODO - add validation service
        return { error: 'amount is required' };
      }
      return await this.transactionsService.withdraw(userId, accountId, amount);
    } catch (error) {
      if (error instanceof Error) {
        return { error: error.message };
      }

      this.logger.error(`unknown error`, error);

      return { error: 'internal server error' };
    }
  }
}
