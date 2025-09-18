import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Logger,
  Res,
  Query,
} from '@nestjs/common';
import { type Response } from 'express';
import { TransactionsService } from './transactions.service';

@Controller('/accounts/:accountId/transactions')
export class TransactionsController {
  constructor(
    private readonly logger: Logger,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Get('/')
  public async getTransactions(
    @Param('accountId') accountId: string,
    @Query('userId') userId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      res.json(
        await this.transactionsService.getTransactions(userId, accountId),
      );
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }

      this.logger.error(`unknown error`, error as Error);
      res.status(500).json({ error: 'internal server error' });
    }
  }

  @Post('despoit')
  public async despoit(
    @Body('userId') userId: string,
    @Body('amount') amount: number,
    @Param('accountId') accountId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      amount = parseFloat(amount.toString());
      if (!amount || isNaN(amount)) {
        // TODO - add validation service
        res.status(400).json({ error: 'amount is required' });
        return;
      }
      res.json(
        await this.transactionsService.despoit(userId, accountId, amount),
      );
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }

      this.logger.error(`unknown error`, error as Error);

      res.status(500).json({ error: 'internal server error' });
    }
  }

  @Post('withdraw')
  public async withdraw(
    @Body('userId') userId: string,
    @Body('amount') amount: number,
    @Param('accountId') accountId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      amount = parseFloat(amount.toString());
      if (!amount || isNaN(amount)) {
        // TODO - add validation service
        res.status(400).json({ error: 'amount is required' });
        return;
      }
      res.json(
        await this.transactionsService.withdraw(userId, accountId, amount),
      );
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }

      this.logger.error(`unknown error`, error);

      res.status(500).json({ error: 'internal server error' });
    }
  }
}
