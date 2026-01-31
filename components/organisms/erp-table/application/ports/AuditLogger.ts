//application/ports
export interface AuditLogger {
  log(event: unknown): void;
}