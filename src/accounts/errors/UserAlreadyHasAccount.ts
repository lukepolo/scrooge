export class UserAlreadyHasAccount extends Error {
  constructor() {
    super('user already has an open account');
  }
}
