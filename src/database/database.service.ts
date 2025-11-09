import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { neon } from '@neondatabase/serverless';
import { User } from '../types/user.types';

@Injectable()
export class DatabaseService {
  private sql: any;

  constructor(private configService: ConfigService) {
    const databaseUrl = this.configService.get<string>('database.url');
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    this.sql = neon(databaseUrl);
  }

  async query(text: string, params: any[] = []): Promise<any[]> {
    try {
      return await this.sql.query(text, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Helper method for transactions
  async transaction(
    queries: Array<{ text: string; params?: any[] }>,
  ): Promise<any[]> {
    try {
      const results: any[] = [];
      for (const query of queries) {
        const result = await this.sql.query(query.text, query.params || []);
        results.push(result);
      }
      return results;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }

  // Helper methods for common operations
  async findOne(
    table: string,
    where: Record<string, any>,
  ): Promise<any | null> {
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

  async insertOne(table: string, data: Record<string, any>): Promise<any> {
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
  ): Promise<any> {
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
}
