// engine/EngineErrorHandler.ts

import { DomainError } from '../domain/errors/DomainError';
import {
  ConsoleAuditLogger,
} from '../infrastructure/Repositories/consoleAuditLogger';

export class EngineErrorHandler {
  constructor(private readonly audit: ConsoleAuditLogger) {}

  /**
   * همه‌ی خطاها — چه DomainError چه runtime error — از اینجا رد می‌شن
   * و از طریق ConsoleAuditLogger لاگ می‌شن.
   */
  handle(error: unknown, context?: string): void {
    if (error instanceof DomainError) {
      this.audit.log({
        type: error.code,
        message: error.message,
        payload: { details: error.details, context },
      });
      return;
    }

    if (error instanceof Error) {
      this.audit.log({
        type: 'ERROR',
        message: error.message,
        payload: { stack: error.stack, context },
      });
      return;
    }

    this.audit.log({
      type: 'ERROR',
      message: 'Unknown error',
      payload: { error, context },
    });
  }

  /** برای جاهایی که store یا table پیدا نشد */
  notFound(entity: string, key: string, context?: string): void {
    this.audit.log({
      type: 'ERROR',
      message: `${entity} "${key}" could not be found`,
      payload: { key, context },
    });
  }
}