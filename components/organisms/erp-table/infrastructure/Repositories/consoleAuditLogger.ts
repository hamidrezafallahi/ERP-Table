//adapters/infra
import { AuditLogger } from '../../application/ports/AuditLogger';

export class ConsoleAuditLogger implements AuditLogger {
  log(event: unknown) {
    console.log('[AuditLog]', event);
  }
}
