import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { User, UserWithoutPassword } from '../types/user.types';
import { LoggerService } from '../common/logger/logger.service';

// Type definitions for better type safety
interface DatabaseRow {
  [key: string]: any;
}

// User-specific types for better type safety
type UserRow = User;

@Injectable()
export class DatabaseService {
  private sql: NeonQueryFunction<false, false>;
  // Whitelist of allowed table names
  private readonly ALLOWED_TABLES = new Set([
    'users',
    'posts',
    'comments',
    'sessions',
    // Add your actual table names here
  ]);

  constructor(
    private configService: ConfigService,
    private loggerService: LoggerService,
  ) {
    const databaseUrl = this.configService.get<string>('database.url');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    this.sql = neon(databaseUrl);
  }

  // Validate table name against whitelist
  private validateTableName(table: string): void {
    if (!this.ALLOWED_TABLES.has(table)) {
      throw new Error(`Invalid table name: ${table}`);
    }
  }

  async query(text: string, params: any[] = []): Promise<DatabaseRow[]> {
    try {
      this.loggerService.logDatabaseQuery(
        text,
        params,
        'DatabaseService.query',
      );
      // Neon expects template strings, but we need to use the query method for parameterized queries
      const result = await this.sql.query(text, params);
      return result as DatabaseRow[];
    } catch (error) {
      this.loggerService.error(
        'Database query failed',
        error,
        'DatabaseService.query',
      );
      throw error;
    }
  }

  // Helper method for transactions
  async transaction(
    queries: Array<{ text: string; params?: any[] }>,
  ): Promise<DatabaseRow[][]> {
    try {
      // Begin transaction
      await this.sql.query('BEGIN');
      this.loggerService.debug(
        'Transaction started',
        'DatabaseService.transaction',
      );

      const results: DatabaseRow[][] = [];

      try {
        // Execute all queries within the transaction
        for (const query of queries) {
          this.loggerService.logDatabaseQuery(
            query.text,
            query.params || [],
            'DatabaseService.transaction',
          );
          const result = await this.sql.query(query.text, query.params || []);
          results.push(result as DatabaseRow[]);
        }

        // Commit transaction if all queries succeed
        await this.sql.query('COMMIT');
        this.loggerService.debug(
          `Transaction committed successfully with ${queries.length} queries`,
          'DatabaseService.transaction',
        );

        return results;
      } catch (queryError) {
        // Rollback transaction if any query fails
        await this.sql.query('ROLLBACK');
        this.loggerService.error(
          'Transaction rolled back due to query failure',
          queryError,
          'DatabaseService.transaction',
        );
        throw queryError;
      }
    } catch (error) {
      this.loggerService.error(
        'Database transaction failed',
        error,
        'DatabaseService.transaction',
      );
      throw error;
    }
  }

  // Advanced transaction method with callback for more complex transaction logic
  async withTransaction<T>(
    callback: (transactionClient: this) => Promise<T>,
  ): Promise<T> {
    try {
      // Begin transaction
      await this.sql.query('BEGIN');
      this.loggerService.debug(
        'Advanced transaction started',
        'DatabaseService.withTransaction',
      );

      try {
        // Execute the callback within the transaction context
        const result = await callback(this);

        // Commit transaction if callback succeeds
        await this.sql.query('COMMIT');
        this.loggerService.debug(
          'Advanced transaction committed successfully',
          'DatabaseService.withTransaction',
        );

        return result;
      } catch (callbackError) {
        // Rollback transaction if callback fails
        await this.sql.query('ROLLBACK');
        this.loggerService.error(
          'Advanced transaction rolled back due to callback failure',
          callbackError,
          'DatabaseService.withTransaction',
        );
        throw callbackError;
      }
    } catch (error) {
      this.loggerService.error(
        'Advanced transaction failed to initialize',
        error,
        'DatabaseService.withTransaction',
      );
      throw error;
    }
  }

  // Simple transaction helpers for common patterns
  async beginTransaction(): Promise<void> {
    await this.sql.query('BEGIN');
    this.loggerService.debug(
      'Manual transaction begun',
      'DatabaseService.beginTransaction',
    );
  }

  async commitTransaction(): Promise<void> {
    await this.sql.query('COMMIT');
    this.loggerService.debug(
      'Manual transaction committed',
      'DatabaseService.commitTransaction',
    );
  }

  async rollbackTransaction(): Promise<void> {
    await this.sql.query('ROLLBACK');
    this.loggerService.debug(
      'Manual transaction rolled back',
      'DatabaseService.rollbackTransaction',
    );
  }

  // Helper methods for common operations
  async findOne(
    table: string,
    where: Record<string, any>,
  ): Promise<DatabaseRow | null> {
    this.validateTableName(table);

    const keys = Object.keys(where);
    const values = Object.values(where);
    const whereClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ');

    const result = await this.query(
      `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`,
      values,
    );

    return result[0] || null;
  }

  // Find one record excluding specified fields (useful for excluding passwords)
  async findOneExcluding(
    table: string,
    where: Record<string, any>,
    excludeFields: string[] = [],
  ): Promise<DatabaseRow | null> {
    this.validateTableName(table);

    const keys = Object.keys(where);
    const values = Object.values(where);
    const whereClause = keys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(' AND ');

    // Get all columns except excluded ones
    let selectClause = '*';
    if (excludeFields.length > 0) {
      // For security, we'll use a subquery approach or explicit column selection
      // This is a simplified version - in production, you might want to get table schema dynamically
      const commonUserColumns = [
        'id',
        'email',
        'name',
        'phone',
        'gender',
        'role',
        'created_at',
        'updated_at',
      ];

      const allowedColumns = commonUserColumns.filter(
        (col) => !excludeFields.includes(col),
      );
      selectClause = allowedColumns.join(', ');
    }

    const result = await this.query(
      `SELECT ${selectClause} FROM ${table} WHERE ${whereClause} LIMIT 1`,
      values,
    );

    return result[0] || null;
  }

  async insertOne(
    table: string,
    data: Record<string, any>,
  ): Promise<DatabaseRow> {
    this.validateTableName(table);

    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    const columns = keys.join(', ');

    const result = await this.query(
      `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`,
      values,
    );

    return result[0];
  }

  async updateOne(
    table: string,
    data: Record<string, any>,
    where: Record<string, any>,
  ): Promise<DatabaseRow> {
    this.validateTableName(table);

    const dataKeys = Object.keys(data);
    const dataValues = Object.values(data);
    const whereKeys = Object.keys(where);
    const whereValues = Object.values(where);

    const setClause = dataKeys
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    const whereClause = whereKeys
      .map((key, index) => `${key} = $${dataKeys.length + index + 1}`)
      .join(' AND ');

    const result = await this.query(
      `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`,
      [...dataValues, ...whereValues],
    );

    return result[0];
  }

  // Type-safe user-specific methods
  async findUserById(id: number): Promise<UserRow | null> {
    const result = await this.findOne('users', { id });
    return result as UserRow | null;
  }

  async findUserByIdWithoutPassword(
    id: number,
  ): Promise<UserWithoutPassword | null> {
    const result = await this.findOneExcluding('users', { id }, ['password']);
    return result as UserWithoutPassword | null;
  }

  async findUserByEmail(email: string): Promise<UserRow | null> {
    const result = await this.findOne('users', { email: email.toLowerCase() });
    return result as UserRow | null;
  }

  async findUserByEmailWithoutPassword(
    email: string,
  ): Promise<UserWithoutPassword | null> {
    const result = await this.findOneExcluding(
      'users',
      { email: email.toLowerCase() },
      ['password'],
    );
    return result as UserWithoutPassword | null;
  }

  async createUser(userData: Record<string, any>): Promise<UserRow> {
    const result = await this.insertOne('users', userData);
    if (!result) {
      throw new Error('Failed to create user');
    }
    return result as UserRow;
  }

  // Example of complex transaction usage
  async createUserWithProfile(
    userData: Record<string, any>,
    profileData: Record<string, any>,
  ): Promise<{ user: DatabaseRow; profile: DatabaseRow }> {
    return this.withTransaction(async (db) => {
      // Create user first
      const user = await db.insertOne('users', userData);

      // Create profile with user ID
      const profileWithUserId = { ...profileData, user_id: user.id };
      const profile = await db.insertOne('profiles', profileWithUserId);

      // Both operations succeed or both are rolled back
      return { user, profile };
    });
  }

  // Example of batch operations with transaction
  async bulkUpdateUsers(
    updates: Array<{ id: number; data: Record<string, any> }>,
  ): Promise<DatabaseRow[]> {
    const queries = updates.map((update) => ({
      text: `UPDATE users SET ${Object.keys(update.data)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ')} WHERE id = $1 RETURNING *`,
      params: [update.id, ...Object.values(update.data)],
    }));

    const results = await this.transaction(queries);
    return results.map((result) => result[0]);
  }
}
