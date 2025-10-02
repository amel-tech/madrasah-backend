import { DatabaseService } from '../../src/database/database.service';

/**
 * Utility class for managing test database operations
 */
export class TestDatabaseUtils {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Cleans all data from the test database
   * This is more thorough than individual table cleanup
   */
  async cleanDatabase(): Promise<void> {
    if (!this.databaseService?.db) {
      console.warn('Database service not available for cleanup');
      return;
    }

    try {
      // Get all table names from the database
      const result = await this.databaseService.db.execute(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename != '__drizzle_migrations'
      `);

      // Disable foreign key checks temporarily
      await this.databaseService.db.execute(
        'SET session_replication_role = replica',
      );

      // Truncate all tables
      if (result.rows && Array.isArray(result.rows)) {
        for (const row of result.rows) {
          if (
            row &&
            typeof row === 'object' &&
            'tablename' in row &&
            typeof row.tablename === 'string'
          ) {
            await this.databaseService.db.execute(
              `TRUNCATE TABLE "${row.tablename}" RESTART IDENTITY CASCADE`,
            );
          }
        }
      }

      // Re-enable foreign key checks
      await this.databaseService.db.execute(
        'SET session_replication_role = DEFAULT',
      );

      console.log('Database cleaned successfully');
    } catch (error) {
      console.warn('Database cleanup failed:', error);
      // Don't throw to avoid breaking tests
    }
  }

  /**
   * Cleans specific tables
   */
  async cleanTables(...tableNames: string[]): Promise<void> {
    if (!this.databaseService?.db) {
      console.warn('Database service not available for table cleanup');
      return;
    }

    try {
      for (const tableName of tableNames) {
        await this.databaseService.db.execute(`DELETE FROM "${tableName}"`);
      }
      console.log(`Tables cleaned: ${tableNames.join(', ')}`);
    } catch (error) {
      console.warn('Table cleanup failed:', error);
    }
  }

  /**
   * Checks if the database connection is healthy
   */
  async checkConnection(): Promise<boolean> {
    if (!this.databaseService?.db) {
      return false;
    }

    try {
      await this.databaseService.db.execute('SELECT 1');
      return true;
    } catch (error) {
      console.error('Database connection check failed:', error);
      return false;
    }
  }
}
