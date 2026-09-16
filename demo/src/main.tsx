import { createRoot } from 'react-dom/client';

import 'persian-data-grid/styles.css';
import DemoComponent from './DemoComponent';
import { InitialComponent } from './InitialComponent';

/**
 * VITE_APP_MODE:
 * - `docs` (default) → marketing / live docs landing
 * - `dev` → interactive QA playground (chrome + ERP table preview)
 *
 * Scripts: `npm run dev:docs` | `npm run dev` / `npm run dev:playground`
 */
const appMode = import.meta.env.VITE_APP_MODE === 'dev' ? 'dev' : 'docs';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Missing #root');
}

createRoot(rootEl).render(
  appMode === 'dev' ? <DemoComponent /> : <InitialComponent />,
);
