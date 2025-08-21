import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from './schema';
import { ILogger, LOGGER } from '@madrasah/common';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;
  public db!: ReturnType<typeof drizzle>;

  constructor(
    private configService: ConfigService,
    @Inject(LOGGER) private readonly logger: ILogger,
  ) {
    this.logger.setContext(DatabaseService.name);
  }

  async onModuleInit() {
    this.pool = new Pool({
      host: this.configService.get('database.host'),
      port: this.configService.get('database.port'),
      user: this.configService.get('database.username'),
      password: this.configService.get('database.password'),
      database: this.configService.get('database.database'),
      ssl: this.configService.get('database.ssl'),
    });

    this.db = drizzle(this.pool, { schema });

    await migrate(this.db, { migrationsFolder: './src/database/migrations' })
      .then(() => {
        this.logger.log('Migrations completed successfully');
      })
      .catch(() => {
        this.logger.error('Migrations failed');
      });

    // Test connection
    try {
      await this.pool.query('SELECT 1');
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Database connection failed:');
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
