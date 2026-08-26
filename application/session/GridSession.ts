import type { TableEngine } from '../../engine/tableEngine';
import type { CollectionScope } from '../../domain/entities/Table';
import type { TableSnapShot } from '../../engine/type';
import type { ChangelogEntry, ChangelogQuery } from '../../infrastructure/projections/ChangelogProjection';
import type { HistoryItem, HistoryQuery } from '../../infrastructure/history/HistoryPanelViewModel';
import type { ViewIntent, ViewIntentDispatcher } from './ViewIntent';

export type GridSessionSubscribeSelected = <TSelected>(
  selector: () => TSelected,
  listener: (selected: TSelected) => void,
  isEqual?: (a: TSelected, b: TSelected) => boolean,
) => () => void;

/**
 * Framework-agnostic session facade (target shape of useGrid / createGrid).
 * Adapters should prefer this over raw Engine.
 */
export interface GridSession {
  readonly store: string;
  readonly tableKey: string;
  dispatchViewIntent: ViewIntentDispatcher;
  handleKeydown(
    event: KeyboardEvent,
    ctx: { activeRowId: number | null; activeColumnId: string | null },
  ): Promise<void>;
  getSnapShot(collectionScope?: CollectionScope): TableSnapShot | null;
  getViewState(): ReturnType<TableEngine['getViewState']>;
  subscribe(cb: () => void): () => void;
  subscribeSelected: GridSessionSubscribeSelected;
  canUndo(): boolean;
  canRedo(): boolean;
  undo(): Promise<boolean>;
  redo(): Promise<boolean>;
  getChangelog(filter?: Omit<ChangelogQuery, 'tableId'>): ChangelogEntry[];
  getChangelogCount(filter?: Omit<ChangelogQuery, 'tableId'>): number;
  subscribeChangelog(
    cb: (entries: ChangelogEntry[]) => void,
    filter?: Omit<ChangelogQuery, 'tableId'>,
  ): () => void;
  getHistoryItems(filter?: Omit<HistoryQuery, 'tableId'>): HistoryItem[];
  getHistoryItemCount(filter?: Omit<HistoryQuery, 'tableId'>): number;
  subscribeHistoryItems(
    cb: (items: HistoryItem[]) => void,
    filter?: Omit<HistoryQuery, 'tableId'>,
  ): () => void;
  getEngine(): TableEngine;
  /** Current virtual-scroll viewport (view state; not domain). */
  getViewport(): import('../../domain/value-objects/Viewport').Viewport;
  getVisibleRange(totalRows?: number): import('../../domain/value-objects/Viewport').VisibleRange;
  projectVisibleRows<T>(rows: readonly T[], totalRows?: number): T[];
}


// Re-export intent types for consumers
export type { ViewIntent, ViewIntentDispatcher };
