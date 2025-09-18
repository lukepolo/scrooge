export class AccountAlreadyClosed extends Error {
  constructor() {
    super('account already closed');
  }
}
