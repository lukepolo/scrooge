import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';
import { LoanDenied } from './errors/LoanDenied';
import { LoanNotFound } from './errors/LoanNotFound';
import { LoanPaymentExceeded } from './errors/LoanPaymentExceeded';

@Injectable()
export class LoansService {
  constructor(private readonly postgresService: PostgresService) {}

  public async applyForLoan(
    userId: string,
    amount: number,
  ): Promise<{ id: number; amount: number; remaining: number }> {
    if (amount <= 0) {
      throw new Error('amount must be greater than 0');
    }
    const [banksAccount] = await this.postgresService.query<
      Array<{ balance: number }>
    >('select * from accounts where user_id = 1');

    if (!banksAccount) {
      throw new Error('banks account not found');
    }

    // TODO - need a lock to verify transaction bank balance is sufficient

    const bankBalance = banksAccount.balance;
    if (amount > bankBalance) {
      throw new LoanDenied();
    }

    const [loan] = await this.postgresService.query<
      Array<{ id: number; amount: number; remaining: number }>
    >(
      `insert into loans (user_id, amount, remaining) values ($1, $2, $2) returning id, amount, remaining`,
      [userId, amount],
    );

    await this.postgresService.query<void>(
      'update accounts set balance = balance - $1 where user_id = 1',
      [amount],
    );

    return loan;
  }

  public async makePayment(loanId: string, userId: string, amount: number) {
    const [loan] = await this.postgresService.query<
      Array<{ id: number; amount: number; remaining: number }>
    >('select * from loans where id = $1 and user_id = $2', [loanId, userId]);

    if (!loan) {
      throw new LoanNotFound();
    }

    if (amount > loan.remaining) {
      throw new LoanPaymentExceeded(loan.remaining, amount);
    }

    const newRemaining = loan.remaining - amount;

    await this.postgresService.query<void>(
      'update loans set remaining = $1 where id = $2',
      [newRemaining, loanId],
    );

    return { loanId, paid: newRemaining === 0, remaining: newRemaining };
  }

  public async getTransactions(
    userId: string,
    loanId: string,
  ): Promise<
    Array<{
      transaction_id: string;
      previous_balance: number;
      new_balance: number;
      posted_date: string;
    }>
  > {
    const [loan] = await this.postgresService.query<
      Array<{ id: number; amount: number; remaining: number }>
    >('select * from loans where id = $1 and user_id = $2', [loanId, userId]);

    if (!loan) {
      throw new LoanNotFound();
    }

    return await this.postgresService.query<
      Array<{
        transaction_id: string;
        previous_balance: number;
        new_balance: number;
        posted_date: string;
      }>
    >(
      'select id as transaction_id, previous_balance, new_balance, created_at as posted_date from loan_transactions where loan_id = $1',
      [loanId],
    );
  }
}
