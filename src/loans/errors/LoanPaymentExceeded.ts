export class LoanPaymentExceeded extends Error {
  constructor(remaining: number, amount: number) {
    super(
      `loan payment exceeded: remaining ${remaining} is less than amount ${amount}`,
    );
  }
}
