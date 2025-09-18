import { Injectable, Logger } from '@nestjs/common';
import { PostgresService } from '../postgres/postgres.service';

@Injectable()
export class LoansService {
    constructor(
        private readonly logger: Logger,
        private readonly postgresService: PostgresService,
    ) {}
}
