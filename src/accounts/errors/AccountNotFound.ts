export class AccountNotFound extends Error {
  constructor() {
    super('account not found');
  }
}
