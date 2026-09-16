import { describe, expect, it } from 'vitest';
import {
  DEFAULT_EVENT_STORE_PREFIX,
  LEGACY_EVENT_STORE_PREFIX,
  eventStoreDbName,
} from '../eventStore/eventStoreName';

describe('eventStoreDbName (PR-80)', () => {
  it('defaults to the neutral persian-data-grid prefix', () => {
    expect(DEFAULT_EVENT_STORE_PREFIX).toBe('persian-data-grid-events');
    expect(eventStoreDbName('erp')).toBe('persian-data-grid-events:erp');
  });

  it('keeps the 0.5.x prefix when hosts opt in', () => {
    expect(LEGACY_EVENT_STORE_PREFIX).toBe('erp-table-events');
    expect(eventStoreDbName('erp', LEGACY_EVENT_STORE_PREFIX)).toBe(
      'erp-table-events:erp',
    );
  });
});
