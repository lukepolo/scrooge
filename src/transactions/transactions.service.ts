import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service'; 

@Injectable()
export class TransactionsService {
    constructor(
        private readonly logger: Logger,
        private readonly postgresService: PostgresService,
    ) {}
}
