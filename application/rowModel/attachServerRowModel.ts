import type { ColumnDef } from '../../domain/types/ColumnDef';
import type { TableEngine } from '../../engine/tableEngine';
import type { GetRowId } from '../../infrastructure/rows/mapRowData';
import {
  BlockCache,
  assembleBlockWindow,
  blockRange,
  blocksCovering,
} from '../../engine/dataOps/blockCache';
import {
  pageWindow,
  SERVER_ROW_LOADING_FLAG,
} from '../../engine/dataOps/rowModel';
import type { GridSession } from '../session/GridSession';
import {
  isServerRowModel,
  type GridDatasource,
  type RowModelType,
} from '../ports/GridDatasource';

export type AttachServerRowModelOptions<TRow> = {
  engine: TableEngine;
  rowModelType: RowModelType;
  datasource: GridDatasource<TRow>;
  columnDefs?: ColumnDef<TRow>[];
  getRowId?: GetRowId<TRow>;
  /** Optional session — viewport scroll drives block fetches (PR-102). */
  session?: GridSession;
  /** Rows per cache block (PR-102). Default 100. */
  cacheBlockSize?: number;
  /** Max blocks retained (LRU). Default 10. */
  maxBlocksInCache?: number;
};

export type ServerRowModelHandle = {
  refresh: () => Promise<void>;
  /** Purge cache and refetch (PR-102). */
  refreshServerSide: () => Promise<void>;
  dispose: () => void;
  /** Test/inspection helper. */
  getCacheSize: () => number;
};

function loadingPlaceholder<TRow>(absoluteIndex: number): TRow {
  return {
    [SERVER_ROW_LOADING_FLAG]: true,
    id: `loading-${absoluteIndex}`,
  } as TRow;
}

function queryFingerprint(
  sortModel: unknown,
  filterModel: unknown,
): string {
  return JSON.stringify({ sortModel, filterModel });
}

/**
 * Wires {@link GridDatasource} with a block cache (PR-102).
 * Sort/filter purge the cache; scroll/page only fetch missing blocks.
 */
export function attachServerRowModel<TRow>(
  opts: AttachServerRowModelOptions<TRow>,
): ServerRowModelHandle {
  const {
    engine,
    rowModelType,
    datasource,
    columnDefs,
    getRowId,
    session,
    cacheBlockSize = 100,
    maxBlocksInCache = 10,
  } = opts;

  if (!isServerRowModel(rowModelType)) {
    return {
      refresh: async () => undefined,
      refreshServerSide: async () => undefined,
      dispose: () => undefined,
      getCacheSize: () => 0,
    };
  }

  engine.setRowModelType(rowModelType);

  const configuredBlockSize =
    typeof cacheBlockSize === 'number' && cacheBlockSize > 0
      ? cacheBlockSize
      : undefined;
  const resolveBlockSize = (): number =>
    Math.max(
      1,
      configuredBlockSize ??
        engine.getViewState()?.pagination.pageSize ??
        100,
    );
  const cache = new BlockCache<TRow>(Math.max(1, maxBlocksInCache));
  const inflight = new Map<number, Promise<void>>();
  let seq = 0;
  let lastQueryFp = '';

  const resolveWindow = (
    blockSize: number,
  ): { startRow: number; endRow: number } => {
    if (session) {
      const total =
        engine.getViewState()?.pagination.totalRows ??
        Math.max(session.getUiRowCount(), blockSize * 2);
      const range = session.getVisibleRange(Math.max(total, blockSize));
      const startRow = Math.max(0, range.startIndex);
      const endRow = Math.max(startRow + 1, range.endIndex);
      return { startRow, endRow };
    }
    const view = engine.getViewState();
    if (!view) return { startRow: 0, endRow: blockSize };
    return pageWindow(view.pagination.page, view.pagination.pageSize);
  };

  const ensureBlock = async (
    blockIndex: number,
    blockSize: number,
  ): Promise<void> => {
    if (cache.has(blockIndex)) {
      cache.get(blockIndex);
      return;
    }
    const existing = inflight.get(blockIndex);
    if (existing) {
      await existing;
      return;
    }
    const { startRow, endRow } = blockRange(blockIndex, blockSize);
    const view = engine.getViewState();
    const sortModel = view?.sortModel ?? [];
    const filterModel = view?.filterModel ?? {};
    const job = (async () => {
      const result = await datasource.getRows({
        startRow,
        endRow,
        sortModel,
        filterModel,
      });
      cache.set(blockIndex, result.rows);
      if (typeof result.lastRow === 'number' && Number.isFinite(result.lastRow)) {
        engine.setServerRowCount(Math.max(0, Math.floor(result.lastRow)));
      } else if (result.rows.length < blockSize) {
        engine.setServerRowCount(startRow + result.rows.length);
      } else {
        const known = engine.getViewState()?.pagination.totalRows ?? 0;
        engine.setServerRowCount(Math.max(known, endRow + blockSize));
      }
    })().finally(() => {
      inflight.delete(blockIndex);
    });
    inflight.set(blockIndex, job);
    await job;
  };

  const applyWindow = (
    startRow: number,
    endRow: number,
    blockSize: number,
  ): void => {
    const { rows } = assembleBlockWindow(
      cache,
      startRow,
      endRow,
      blockSize,
      (i) => loadingPlaceholder<TRow>(i),
    );
    engine.applyHostRowData(rows, columnDefs, getRowId);
  };

  const refresh = async (): Promise<void> => {
    const ticket = ++seq;
    const view = engine.getViewState();
    const fp = queryFingerprint(view?.sortModel ?? [], view?.filterModel ?? {});
    if (fp !== lastQueryFp) {
      cache.clear();
      lastQueryFp = fp;
    }

    const blockSize = resolveBlockSize();
    let { startRow, endRow } = resolveWindow(blockSize);
    const total = engine.getViewState()?.pagination.totalRows;
    if (typeof total === 'number' && total >= 0) {
      endRow = Math.min(endRow, Math.max(startRow + 1, total));
    }
    const needed = blocksCovering(startRow, endRow, blockSize);

    applyWindow(startRow, endRow, blockSize);

    await Promise.all(needed.map((bi) => ensureBlock(bi, blockSize)));
    if (ticket !== seq) return;
    applyWindow(startRow, endRow, blockSize);
  };

  const refreshServerSide = async (): Promise<void> => {
    cache.clear();
    lastQueryFp = '';
    await refresh();
  };

  engine.bindViewQueryListener(() => {
    void refresh();
  });

  let unsubViewport: (() => void) | undefined;
  if (session) {
    unsubViewport = session.subscribeViewport(() => {
      void refresh();
    });
  }

  void refresh();

  return {
    refresh,
    refreshServerSide,
    dispose: () => {
      engine.bindViewQueryListener(undefined);
      unsubViewport?.();
      cache.clear();
      inflight.clear();
    },
    getCacheSize: () => cache.size,
  };
}

/** @deprecated Prefer {@link SERVER_ROW_LOADING_FLAG} from `engine/dataOps/rowModel`. */
export const LOADING_FLAG = SERVER_ROW_LOADING_FLAG;
export { SERVER_ROW_LOADING_FLAG };
