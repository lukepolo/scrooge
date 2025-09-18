import {
  Controller,
  Post,
  Body,
  Param,
  Logger,
  Res,
  Get,
  Query,
} from '@nestjs/common';
import { type Response } from 'express';
import { LoansService } from './loans.service';

@Controller('/loans')
export class LoansController {
  constructor(
    private readonly logger: Logger,
    private readonly loansService: LoansService,
  ) {}

  @Get('/:loanId')
  public async getTransactions(
    @Param('loanId') loanId: string,
    @Query('userId') userId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      res.json(await this.loansService.getTransactions(userId, loanId));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }

      this.logger.error(`unknown error`, error as Error);
      res.status(500).json({ error: 'internal server error' });
    }
  }

  @Post('/')
  public async apply(
    @Body('userId') userId: string,
    @Body('amount') amount: number,
    @Res() res: Response,
  ): Promise<void | {
    error?: string;
    id?: number;
    amount?: number;
    remaining?: number;
  }> {
    try {
      amount = parseFloat(amount.toString());
      if (!amount || isNaN(amount)) {
        // TODO - add validation service
        res.status(400).json({ error: 'amount is required' });
        return;
      }
      res.json(await this.loansService.applyForLoan(userId, amount));
    } catch (error) {
      console.log('error', error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }

      this.logger.error(`unknown error`, error as Error);

      res.status(500).json({ error: 'internal server error' });
    }
  }

  @Post('/pay/:loanId')
  public async makePayment(
    @Param('loanId') loanId: string,
    @Body('userId') userId: string,
    @Body('amount') amount: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      amount = parseFloat(amount.toString());
      if (!amount || isNaN(amount)) {
        // TODO - add validation service
        res.status(400).json({ error: 'amount is required' });
        return;
      }
      res.json(await this.loansService.makePayment(loanId, userId, amount));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }

      this.logger.error(`unknown error`, error as Error);
    }
  }
}
