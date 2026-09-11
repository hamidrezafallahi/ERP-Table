import type { Unsubscribe } from '../../application/ports/EventStore';
import type {
  ChangelogEntry,
  ChangelogProjection,
  ChangelogQuery,
} from '../projections/ChangelogProjection';

export type HistorySeverity = 'info' | 'warning' | 'error';
export type HistoryCategory = 'data' | 'structure' | 'view' | 'system';

export interface HistoryClassification {
  readonly severity: HistorySeverity;
  readonly category: HistoryCategory;
}

export interface HistoryQuery extends ChangelogQuery {
  severity?: HistorySeverity;
  category?: HistoryCategory;
}

export interface HistoryItem {
  readonly id: string;
  readonly type: string;
  readonly title: string;
  readonly description: string;
  readonly occurredAt: number;
  readonly tableId: string;
  readonly actorId: string;
  readonly severity: HistorySeverity;
  readonly category: HistoryCategory;
  readonly raw: ChangelogEntry;
}

const HISTORY_CLASSIFICATIONS: Record<string, HistoryClassification> = {
  CELL_CHANGED: { category: 'data', severity: 'info' },
  CELL_DISPLAY_CHANGED: { category: 'data', severity: 'info' },
  ROW_ADDED: { category: 'data', severity: 'info' },
  NEW_ROW_ADDED: { category: 'data', severity: 'info' },
  ROW_DELETED: { category: 'data', severity: 'warning' },
  ROW_RESTORED: { category: 'data', severity: 'info' },
  ROW_REORDERED: { category: 'data', severity: 'info' },
  ROW_DESCRIPTION_SAVED: { category: 'data', severity: 'info' },
  DYNAMIC_PROJECTION_DONE: { category: 'data', severity: 'info' },
  DYNAMIC_DATA_REQUESTED: { category: 'data', severity: 'info' },
  VALIDATION_FAILED: { category: 'data', severity: 'error' },
  CELL_EDIT_CONFLICTED: { category: 'data', severity: 'error' },
  COLUMN_REORDERED: { category: 'structure', severity: 'info' },
  UNIT_COLUMN_ADDED: { category: 'structure', severity: 'info' },
  ACTIVE_COLLECTION_CHANGED: { category: 'structure', severity: 'info' },
  PAGE_CHANGED: { category: 'view', severity: 'info' },
  PAGE_SIZE_CHANGED: { category: 'view', severity: 'info' },
  VIEWPORT_CHANGED: { category: 'view', severity: 'info' },
  ROWS_LOADED: { category: 'system', severity: 'info' },
  TABLE_RESET: { category: 'system', severity: 'warning' },
  TABLE_DELETED: { category: 'system', severity: 'warning' },
  INVARIANT_VIOLATION: { category: 'system', severity: 'error' },
};

export function classifyHistoryEvent(type: string): HistoryClassification {
  return HISTORY_CLASSIFICATIONS[type] ?? { category: 'system', severity: 'info' };
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value == null) return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function describeEntry(entry: ChangelogEntry): Pick<HistoryItem, 'title' | 'description'> {
  const payload = entry.payload as Record<string, unknown> | null;
  const rowId = payload?.rowId;
  const columnId = payload?.columnId;

  switch (entry.type) {
    case 'CELL_CHANGED':
      return {
        title: 'Cell changed',
        description:
          payload?.previousValue !== undefined
            ? `Row ${rowId}, column "${columnId}" changed from ${formatValue(payload?.previousValue)} to ${formatValue(payload?.newValue)}.`
            : `Row ${rowId}, column "${columnId}" changed to ${formatValue(payload?.newValue)}.`,
      };
    case 'CELL_DISPLAY_CHANGED':
      return {
        title: 'Cell display changed',
        description: `Row ${rowId}, column "${columnId}" display changed to ${formatValue(payload?.newValue)}.`,
      };
    case 'PAGE_CHANGED':
      return {
        title: 'Page changed',
        description: `Table page changed to ${formatValue(payload?.page)}.`,
      };
    case 'PAGE_SIZE_CHANGED':
      return {
        title: 'Page size changed',
        description: `Page size changed to ${formatValue(payload?.pageSize)}.`,
      };
    case 'VIEWPORT_CHANGED':
      return {
        title: 'Viewport changed',
        description: `Scroll offset ${formatValue(payload?.scrollOffset)}; visible [${formatValue(payload?.startIndex)}–${formatValue(payload?.endIndex)}).`,
      };
    case 'ROW_ADDED':
    case 'NEW_ROW_ADDED':
      return {
        title: 'Row added',
        description: `Row ${formatValue(payload?.rowId)} was added.`,
      };
    case 'ROW_DELETED':
      return {
        title: 'Row deleted',
        description: `Row ${formatValue(payload?.rowId)} was deleted.`,
      };
    case 'ROW_RESTORED':
      return {
        title: 'Row restored',
        description: `Row ${formatValue(payload?.rowId)} was restored.`,
      };
    case 'ROW_REORDERED':
      return {
        title: 'Rows reordered',
        description: `Rows moved from ${formatValue(payload?.sourceIndex)} to ${formatValue(payload?.destIndex)}.`,
      };
    case 'COLUMN_REORDERED':
      return {
        title: 'Columns reordered',
        description: `Columns moved from ${formatValue(payload?.sourceIndex)} to ${formatValue(payload?.destIndex)}.`,
      };
    case 'ROW_DESCRIPTION_SAVED':
      return {
        title: 'Description saved',
        description: `Row ${formatValue(payload?.rowId)} description flag changed to ${formatValue(payload?.description)}.`,
      };
    case 'ACTIVE_COLLECTION_CHANGED':
      return {
        title: 'Active collection changed',
        description: 'The active collection was changed.',
      };
    case 'TABLE_RESET':
      return {
        title: 'Table reset',
        description: 'The table was reset.',
      };
    case 'TABLE_DELETED':
      return {
        title: 'Table deleted',
        description: 'The table was deleted.',
      };
    case 'UNIT_COLUMN_ADDED':
      return {
        title: 'Unit columns updated',
        description: `Unit-level columns updated: ${formatValue(payload?.reason)}.`,
      };
    case 'VALIDATION_FAILED':
      return {
        title: 'Validation failed',
        description: formatValue(payload?.reason ?? payload?.message ?? 'Validation failed.'),
      };
    case 'CELL_EDIT_CONFLICTED':
      return {
        title: 'Cell edit conflicted',
        description: `Row ${rowId}, column "${columnId}" could not be saved because of a version conflict.`,
      };
    case 'INVARIANT_VIOLATION':
      return {
        title: 'Invariant violation',
        description: formatValue(payload?.reason ?? payload?.message ?? 'A domain invariant was violated.'),
      };
    default:
      return {
        title: entry.type,
        description: `Event ${entry.type} was recorded.`,
      };
  }
}

function toChangelogQuery(filter: HistoryQuery): ChangelogQuery {
  const { severity: _severity, category: _category, limit: _limit, ...changelogFilter } = filter;
  return changelogFilter;
}

function applyHistoryFilters(items: HistoryItem[], filter: HistoryQuery): HistoryItem[] {
  let result = items;

  if (filter.severity) {
    result = result.filter((item) => item.severity === filter.severity);
  }
  if (filter.category) {
    result = result.filter((item) => item.category === filter.category);
  }
  if (filter.limit && filter.limit > 0) {
    result = result.slice(-filter.limit);
  }

  return result;
}

export class HistoryPanelViewModel {
  constructor(private readonly changelogProjection: ChangelogProjection) {}

  query(filter: HistoryQuery = {}): HistoryItem[] {
    return applyHistoryFilters(
      this.changelogProjection.query(toChangelogQuery(filter)).map((entry) => this.toHistoryItem(entry)),
      filter,
    );
  }

  count(filter: HistoryQuery = {}): number {
    return this.query(filter).length;
  }

  subscribe(
    cb: (items: HistoryItem[]) => void,
    filter: HistoryQuery = {},
  ): Unsubscribe {
    return this.changelogProjection.subscribe((entries) => {
      cb(applyHistoryFilters(entries.map((entry) => this.toHistoryItem(entry)), filter));
    }, toChangelogQuery(filter));
  }

  private toHistoryItem(entry: ChangelogEntry): HistoryItem {
    const description = describeEntry(entry);
    const classification = classifyHistoryEvent(entry.type);

    return {
      id: entry.eventId,
      type: entry.type,
      title: description.title,
      description: description.description,
      occurredAt: entry.occurredAt,
      tableId: entry.tableId,
      actorId: entry.actorId,
      severity: classification.severity,
      category: classification.category,
      raw: entry,
    };
  }
}
