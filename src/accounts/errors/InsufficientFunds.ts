export class InsufficientFunds extends Error {
  constructor(currentBalance: number, amount: number) {
    super(
      `insufficient funds: current balance ${currentBalance} is less than amount ${amount}`,
    );
  }
}
