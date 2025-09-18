export class UnableToUpdateBalance extends Error {
  constructor() {
    super('unable to update account balance');
  }
}
