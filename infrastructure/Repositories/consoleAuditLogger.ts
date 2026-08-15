//adapters/infra
import { AuditLogger } from '../../application/ports/AuditLogger';

export class ConsoleAuditLogger implements AuditLogger {
  log(event: unknown) {
   console.log('[AuditLog]', event);
  }
  error(event: unknown) {
   console.error('[AuditLog]', event);
  }
  warn(event: unknown) {
   console.warn('[AuditLog]', event);
  }
  info(event: unknown) {
   console.info('[AuditLog]', event);
  }
}
