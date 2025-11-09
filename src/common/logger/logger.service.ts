import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerService {
  private readonly logger = new Logger();
  private readonly isProduction: boolean;

  constructor(private configService: ConfigService) {
    this.isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
  }

  private sanitizeError(error: any): any {
    if (this.isProduction) {
      // In production, only log essential error information
      return {
        message: error?.message || 'An error occurred',
        code: error?.code,
        status: error?.status,
      };
    }

    // In development, include more details for debugging
    return {
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      status: error?.status,
    };
  }

  log(message: string, context?: string) {
    this.logger.log(message, context);
  }

  error(message: string, error?: any, context?: string) {
    const sanitizedError = error ? this.sanitizeError(error) : undefined;

    if (sanitizedError) {
      this.logger.error(
        `${message}: ${JSON.stringify(sanitizedError)}`,
        context,
      );
    } else {
      this.logger.error(message, context);
    }
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, context);
  }

  debug(message: string, context?: string) {
    if (!this.isProduction) {
      this.logger.debug(message, context);
    }
  }

  verbose(message: string, context?: string) {
    if (!this.isProduction) {
      this.logger.verbose(message, context);
    }
  }

  // Method for logging database queries in development only
  logDatabaseQuery(query: string, params?: any[], context?: string) {
    if (!this.isProduction) {
      this.logger.debug(`Query: ${query}`, context);
      if (params && params.length > 0) {
        this.logger.debug(`Params: ${JSON.stringify(params)}`, context);
      }
    }
  }

  // Method for logging authentication events
  logAuthEvent(event: string, userId?: string, details?: any) {
    const logMessage = `Auth Event: ${event}`;
    const logContext = userId ? `User-${userId}` : 'Auth';

    if (this.isProduction) {
      // In production, log minimal auth information
      this.logger.log(
        `${logMessage} - User: ${userId || 'Unknown'}`,
        logContext,
      );
    } else {
      // In development, include more details
      this.logger.log(
        `${logMessage} - ${JSON.stringify({ userId, ...details })}`,
        logContext,
      );
    }
  }
}
