export class LoanNotFound extends Error {
  constructor() {
    super('loan not found');
  }
}
