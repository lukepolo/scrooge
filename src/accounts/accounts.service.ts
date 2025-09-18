import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { UserAlreadyHasAccount } from './errors/UserAlreadyHasAccount';
import { AccountNotFound } from './errors/AccountNotFound';
import { AccountAlreadyClosed } from './errors/AccountAlreadyClosed';

@Injectable()
export class AccountsService {
  constructor(
    private readonly logger: Logger,
    private readonly postgresService: PostgresService,
  ) {}

  public async openAccount(userId: string) : Promise<number> {
    const [account] = await this.postgresService.query<
      Array<{ id: number; deleted_at: string }>
    >('select id, deleted_at from accounts where user_id = $1', [userId]);

    if (account) {
      if (account.deleted_at) {
        await this.postgresService.query<void>(
          'update accounts set deleted_at = null where id = $1',
          [account.id],
        );
        return account.id;
      }
      throw new UserAlreadyHasAccount();
    }

    const [newAccount] = await this.postgresService.query<
      Array<{ id: number }>
    >('insert into accounts (user_id) values ($1) returning id', [userId]);

    this.logger.log(`Account opened for user ${userId}`, newAccount.id);

    return newAccount.id;
  }

  public async closeAccount(userId: string, accountId: string) {
    const [account] = await this.postgresService.query<
      Array<{ id: number; deleted_at: string }>
    >('select id, deleted_at from accounts where id = $1 and user_id = $2', [
      parseInt(accountId),
      userId,
    ]);

    if (!account) {
      throw new AccountNotFound();
    }

    if (account.deleted_at) {
      throw new AccountAlreadyClosed();
    }

    await this.postgresService.query<void>(
      'update accounts set deleted_at = now() where id = $1',
      [accountId],
    );

    this.logger.log(`Account closed ${accountId} for user ${userId}`);
  }
}
