import { Pool } from 'pg';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PostgresConfig } from '../configs/types/PostgresConfig';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Logger } from '@nestjs/common';

@Injectable()
export class PostgresService {
  private pool: Pool;
  private config?: PostgresConfig;

  constructor(
    protected readonly logger: Logger,
    readonly configService: ConfigService,
  ) {
    this.config = configService.get<PostgresConfig>('postgres');
    if (!this.config) {
      throw new Error('postgres config not found');
    }
    this.pool = new Pool(this.config.connections.default);
  }

  public getPoolStats() {
    const { totalCount, idleCount, waitingCount } = this.pool;
    return { totalCount, idleCount, waitingCount };
  }

  public async query<T>(
    sql: string,
    bindings?: Array<
      | string
      | number
      | Date
      | bigint
      | Buffer
      | Array<string>
      | Array<number>
      | Array<Date>
      | Array<bigint>
    >,
  ): Promise<T> {
    const result = await this.pool.query(sql, bindings);

    if (result.rows) {
      return result.rows as unknown as T;
    }

    return result as unknown as T;
  }

  public async setup() {
    await this.query(
      'create table if not exists schema_migrations (version bigint not null, dirty boolean not null)',
    );

    await this.applyMigrations(path.resolve('./migrations'));
  }

  private async applyMigrations(path: string): Promise<number> {
    let completed = 0;
    const applied = await this.getAppliedVersions();
    const available = this.getAvailableVersions(path);

    if (available.size > 0) {
      this.logger.log('Migrations: Running');
      for (const [version, sql] of available) {
        if (!applied.has(version)) {
          this.logger.log('    applying', version.toString());
          let patchedSQL = sql;
          const disableTransactions = sql.startsWith(`-- @disable-transaction`);
          const updateSchemaMigrations = `insert into schema_migrations (version, dirty) values (${version}, false)`;
          if (!disableTransactions) {
            patchedSQL = `begin;${patchedSQL};${updateSchemaMigrations};commit;`;
          }

          try {
            await this.query(patchedSQL);
            if (disableTransactions) {
              await this.query(updateSchemaMigrations);
            }
            completed++;
          } catch (error) {
            throw new Error(
              `failed to apply migration ${version}: ${error instanceof Error ? error.message : error}`,
            );
          }
        }
      }
      this.logger.log(`Migrations: ${completed} Completed`);
    }

    return completed;
  }

  private getAvailableVersions(path: string) {
    const map = new Map<string, string>();
    const dirs = fs.readdirSync(path);
    for (const dir of dirs) {
      const version = dir.split('_').shift();
      if (version) {
        const file = `${path}/${dir}/up.sql`;
        const sql = fs.readFileSync(file, 'utf8');
        if (map.get(version)) {
          throw Error(`duplicate version: ${version}`);
        }
        map.set(version, sql);
      }
    }
    return new Map(
      [...map.entries()].sort(([versionA], [versionB]) => {
        if (versionA > versionB) {
          return 1;
        } else if (versionA < versionB) {
          return -1;
        }
        return 0;
      }),
    );
  }

  private async getAppliedVersions() {
    const versions = new Set<string>();
    const appliedVerions = await this.query<
      Array<{
        version: string;
      }>
    >('select version from schema_migrations order by version');

    for (const appliedVerion of appliedVerions) {
      versions.add(appliedVerion.version);
    }
    return versions;
  }

  public async apply(filePath: string): Promise<void> {
    const filePathStats = fs.statSync(filePath);

    if (filePathStats.isDirectory()) {
      const files = fs.readdirSync(filePath);
      for (const file of files) {
        await this.apply(path.join(filePath, file));
      }
      return;
    }

    try {
      const sql = fs.readFileSync(filePath, 'utf8');

      const digest = this.calcSqlDigest(sql);
      const setting = path.relative(
        process.cwd(),
        filePath.replace('.sql', ''),
      );

      if (digest === (await this.getSetting(setting))) {
        return;
      }

      this.logger.log(`    applying ${path.basename(filePath)}`);
      await this.query(`begin;${sql};commit;`);

      await this.setSetting(setting, digest);
    } catch (error) {
      throw new Error(
        `failed to exec sql ${path.basename(filePath)}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  public async getSetting(name: string) {
    try {
      const [data] = await this.query<
        Array<{
          hash: string;
        }>
      >('SELECT hash FROM migration_hashes.hashes WHERE name = $1', [name]);

      return data?.hash;
    } catch (error) {
      throw new Error(
        `unable to get setting ${name}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  public async setSetting(name: string, hash: string) {
    try {
      await this.query(
        'insert into migration_hashes.hashes (name, hash) values ($1, $2) on conflict (name) do update set hash = $2',
        [name, hash],
      );
    } catch (error) {
      throw new Error(
        `unable to set setting ${name}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  public calcSqlDigest(data: string | Array<string>) {
    const hash = crypto.createHash('sha256');
    if (!Array.isArray(data)) {
      data = [data];
    }

    for (const datum of data) {
      hash.update(datum);
    }

    return hash.digest('base64');
  }
}
