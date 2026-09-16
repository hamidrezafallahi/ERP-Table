import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import BasicExample from './examples/basic';
import SortFilterExample from './examples/sortFilter';
import EditingValidationExample from './examples/editingValidation';
import SelectionClipboardExample from './examples/selectionClipboard';
import Virtual100kExample from './examples/virtual100k';
import InfiniteServerExample from './examples/infiniteServer';
import GroupingAggExample from './examples/groupingAgg';
import ThemeDarkExample from './examples/themeDark';
import CustomCellExample from './examples/customCell';
import ExportPluginsExample from './examples/exportPlugins';
import JalaliDatesExample from './examples/jalaliDates';
import HistoryAuditExample from './examples/historyAudit';
import OfflineStatusExample from './examples/offlineStatus';
import SyncConflictsExample from './examples/syncConflicts';
import PresencePeersExample from './examples/presencePeers';

export const EXAMPLES = [
  { id: 'basic', title: '01 · Basic', Component: BasicExample },
  { id: 'sort-filter', title: '02 · Sort / filter', Component: SortFilterExample },
  {
    id: 'editing-validation',
    title: '03 · Editing + validation',
    Component: EditingValidationExample,
  },
  {
    id: 'selection-clipboard',
    title: '04 · Selection + clipboard',
    Component: SelectionClipboardExample,
  },
  { id: 'virtual-100k', title: '05 · Virtual 100k', Component: Virtual100kExample },
  {
    id: 'infinite-server',
    title: '06 · Infinite / server',
    Component: InfiniteServerExample,
  },
  { id: 'grouping-agg', title: '07 · Grouping + agg', Component: GroupingAggExample },
  { id: 'theme-dark', title: '08 · Theme dark', Component: ThemeDarkExample },
  { id: 'custom-cell', title: '09 · Custom cell', Component: CustomCellExample },
  { id: 'export', title: '10 · Export Excel/CSV', Component: ExportPluginsExample },
  { id: 'jalali-dates', title: '11 · Jalali dates', Component: JalaliDatesExample },
  { id: 'history-audit', title: '12 · History / audit', Component: HistoryAuditExample },
  { id: 'offline-status', title: '13 · Offline status', Component: OfflineStatusExample },
  { id: 'sync-conflicts', title: '14 · Sync conflicts', Component: SyncConflictsExample },
  { id: 'presence-peers', title: '15 · Presence peers', Component: PresencePeersExample },
] as const;

function App() {
  const initial =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('example') ?? 'basic'
      : 'basic';
  const [active, setActive] = useState(initial);
  const current = useMemo(
    () => EXAMPLES.find((e) => e.id === active) ?? EXAMPLES[0],
    [active],
  );

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16, maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, margin: '0 0 4px' }}>persian-data-grid examples</h1>
      <p style={{ margin: '0 0 16px', opacity: 0.7, fontSize: 14 }}>
        PR-130 gallery — pick an example. Open in StackBlitz from the repo README.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {EXAMPLES.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => {
              setActive(e.id);
              const url = new URL(window.location.href);
              url.searchParams.set('example', e.id);
              window.history.replaceState({}, '', url);
            }}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: e.id === current.id ? '2px solid #0f766e' : '1px solid #d1d5db',
              background: e.id === current.id ? '#ecfdf5' : '#fff',
              cursor: 'pointer',
            }}
          >
            {e.title}
          </button>
        ))}
      </div>
      <current.Component />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
