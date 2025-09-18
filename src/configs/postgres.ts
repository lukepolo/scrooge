import { PostgresConfig } from './types/PostgresConfig';

export default (): {
  postgres: PostgresConfig;
} => ({
  postgres: {
    connections: {
      default: {
        user: process.env.POSTGRES_USER || 'scrooge',
        password: process.env.POSTGRES_PASSWORD || 'scrooge',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: process.env.POSTGRES_SERVICE_PORT
          ? parseInt(process.env.POSTGRES_SERVICE_PORT)
          : undefined,
        database: process.env.POSTGRES_DB || 'scrooge',
        statement_timeout: 1000 * 60,
        max: parseInt(process.env.DB_MAX_POOLS || '5'),
      },
    },
  },
});
