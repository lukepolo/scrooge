import { Test, TestingModule } from '@nestjs/testing';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { Logger } from '@nestjs/common';
import { type Response } from 'express';
/* eslint-disable @typescript-eslint/unbound-method */

describe('AccountsController', () => {
  let controller: AccountsController;
  let accountsService: jest.Mocked<
    Pick<AccountsService, 'openAccount' | 'closeAccount' | 'getAccount'>
  >;
  let logger: { log: jest.Mock; error: jest.Mock };

  const createResponseMock = (): Response => {
    const resLike: { status: jest.Mock; json: jest.Mock; send: jest.Mock } = {
      status: jest.fn(),
      json: jest.fn(),
      send: jest.fn(),
    };
    resLike.status.mockImplementation(() => resLike);
    resLike.json.mockImplementation(() => resLike);
    return resLike as unknown as Response;
  };

  beforeEach(async () => {
    accountsService = {
      openAccount: jest.fn<Promise<number>, [string]>(),
      closeAccount: jest.fn<Promise<void>, [string, string]>(),
      getAccount: jest.fn(),
    };

    logger = { log: jest.fn(), error: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountsController],
      providers: [
        { provide: AccountsService, useValue: accountsService },
        { provide: Logger, useValue: logger },
      ],
    }).compile();

    controller = module.get<AccountsController>(AccountsController);
  });

  describe('open', () => {
    it('returns 400 when userId is missing', async () => {
      const res = createResponseMock();

      await controller.open(
        undefined as unknown as string,
        res as unknown as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'userId is required' });
      expect(accountsService.openAccount).not.toHaveBeenCalled();
    });

    it('should allow a user to open an account successfully', async () => {
      const res = createResponseMock();
      const userId = 'user-123';
      const accountId = 456;
      accountsService.openAccount.mockResolvedValueOnce(accountId);

      await controller.open(userId, res as unknown as Response);

      expect(accountsService.openAccount).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(accountId);
    });

    it('should not allow a user to have more than 1 open account', async () => {
      const res = createResponseMock();
      const userId = 'user-with-existing-account';
      const errorMessage = 'user already has an open account';
      accountsService.openAccount.mockRejectedValueOnce(
        new Error(errorMessage),
      );

      await controller.open(userId, res as unknown as Response);

      expect(accountsService.openAccount).toHaveBeenCalledWith(userId);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });

    it('returns 500 when service throws non-Error and logs it', async () => {
      const res = createResponseMock();
      accountsService.openAccount.mockRejectedValueOnce({ some: 'thing' });

      await controller.open('user-3', res as unknown as Response);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'internal server error',
        accountId: 'user-3',
      });
    });
  });

  describe('close', () => {
    it('returns 400 when userId is missing', async () => {
      const res = createResponseMock();

      await controller.close(
        undefined as unknown as string,
        '10',
        res as unknown as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'userId is required' });
      expect(accountsService.closeAccount).not.toHaveBeenCalled();
    });

    it('returns 400 when accountId is missing', async () => {
      const res = createResponseMock();

      await controller.close(
        'user-1',
        '' as unknown as string,
        res as unknown as Response,
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'accountId is required' });
      expect(accountsService.closeAccount).not.toHaveBeenCalled();
    });

    it('should allow a user to close an account successfully', async () => {
      const res = createResponseMock();
      const userId = 'user-123';
      const accountId = '456';
      accountsService.closeAccount.mockResolvedValueOnce();

      await controller.close(userId, accountId, res as unknown as Response);

      expect(accountsService.closeAccount).toHaveBeenCalledWith(
        userId,
        accountId,
      );
      expect(res.send).toHaveBeenCalled();
    });

    it('should return 400 when trying to close a non-existent account', async () => {
      const res = createResponseMock();
      const userId = 'user-123';
      const accountId = '999';
      const errorMessage = 'account not found';
      accountsService.closeAccount.mockRejectedValueOnce(
        new Error(errorMessage),
      );

      await controller.close(userId, accountId, res as unknown as Response);

      expect(accountsService.closeAccount).toHaveBeenCalledWith(
        userId,
        accountId,
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });

    it('should return 400 when trying to close an already closed account', async () => {
      const res = createResponseMock();
      const userId = 'user-123';
      const accountId = '456';
      const errorMessage = 'account already closed';
      accountsService.closeAccount.mockRejectedValueOnce(
        new Error(errorMessage),
      );

      await controller.close(userId, accountId, res as unknown as Response);

      expect(accountsService.closeAccount).toHaveBeenCalledWith(
        userId,
        accountId,
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: errorMessage });
    });

    it('returns 500 when service throws non-Error and logs it', async () => {
      const res = createResponseMock();
      accountsService.closeAccount.mockRejectedValueOnce({ bad: true });

      await controller.close('user-1', '77', res as unknown as Response);

      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'internal server error' });
    });
  });
});
