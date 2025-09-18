import {
  Body,
  Controller,
  Param,
  Post,
  Delete,
  Res,
  Logger,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { type Response } from 'express';

@Controller('accounts')
export class AccountsController {
  constructor(
    private readonly logger: Logger,
    private readonly accountsService: AccountsService,
  ) {}

  @Post('open')
  public async open(
    @Body('userId') userId: string,
    @Res() res: Response,
  ): Promise<void | {
    error?: string;
    accountId?: string;
  }> {
    try {
      if (!userId) {
        // TODO - add validation service
        res.status(400).json({ error: 'userId is required' });
        return;
      }

      const result = await this.accountsService.openAccount(userId);

      res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }

      this.logger.error(`unknown error`, error);

      res
        .status(500)
        .json({ error: 'internal server error', accountId: userId });
    }
  }

  @Delete(':accountId/close')
  public async close(
    @Body('userId') userId: string,
    @Param('accountId') accountId: string,
    @Res() res: Response,
  ): Promise<void | {
    error?: string;
  }> {
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }

    try {
      if (!accountId) {
        // TODO - add validation service
        res.status(400).json({ error: 'accountId is required' });
        return;
      }

      await this.accountsService.closeAccount(userId, accountId);
      res.send();
    } catch (error: any) {
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
        return;
      }

      this.logger.error(`unknown error`, error);

      res.status(500).json({ error: 'internal server error' });
    }
  }
}
