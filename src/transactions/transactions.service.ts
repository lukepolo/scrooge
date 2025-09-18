import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { AccountsService } from '../accounts/accounts.service';
import { UnableToUpdateBalance } from './errors/UnableToupdateBalance';
import { InsufficientFunds } from './errors/InsufficientFunds';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly logger: Logger,
    private readonly postgresService: PostgresService,
    private readonly accountsService: AccountsService,
  ) {}

  public async despoit(
    userId: string,
    accountId: string,
    amount: number,
  ): Promise<{ balance: number }> {
    await this.accountsService.getAccount(userId, accountId);

    const results = await this.postgresService.query<
      Array<{
        balance: number;
      }>
    >(
      'update accounts set balance = balance + $1 where id = $2 returning balance',
      [amount, accountId],
    );

    const balance = results.at(0)?.balance;
    if (!balance) {
      throw new UnableToUpdateBalance();
    }

    return { balance };
  }

  public async withdraw(
    userId: string,
    accountId: string,
    amount: number,
  ): Promise<{ balance: number }> {
    const account = await this.accountsService.getAccount(userId, accountId);

    if (account.balance < amount) {
      throw new InsufficientFunds(account.balance, amount);
    }

    const results = await this.postgresService.query<
      Array<{
        balance: number;
      }>
    >(
      'update accounts set balance = balance - $1 where id = $2 returning balance',
      [amount, accountId],
    );

    const balance = results.at(0)?.balance;

    if (!balance) {
      throw new UnableToUpdateBalance();
    }

    return { balance };
  }

  public async getTransactions(
    userId: string,
    accountId: string,
  ): Promise<
    Array<{
      transaction_id: string;
      previous_balance: number;
      new_balance: number;
      posted_date: string;
    }>
  > {
    await this.accountsService.getAccount(userId, accountId);
    return await this.postgresService.query<
      Array<{
        transaction_id: string;
        previous_balance: number;
        new_balance: number;
        posted_date: string;
      }>
    >(
      'select id as transaction_id, previous_balance, new_balance, created_at as posted_date from account_transactions where account_id = $1',
      [accountId],
    );
  }
}
