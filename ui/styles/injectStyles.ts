/**
 * GENERATED from ui/styles/erp-table.css — do not edit by hand.
 * Regenerate: yarn generate:inject-styles
 */
const STYLE_ID = 'erp-table-injected-css';

const CSS = `/* Visual tokens copied from the ERP Tailwind theme so the published
   table looks identical after npm install (no host Tailwind scan). */

/* Canonical class is \`.pdg-grid\` (PR-87 / D13). \`.erp-table\` is a one-version alias. */
.pdg-grid,
.erp-table {
  --pdg-main-black: #0e0e0e;
  --pdg-main-white: #fff;
  --pdg-gray-3: #f4f4f4;
  --pdg-gray-5: #ececec;
  --pdg-gray-6: #cecece;
  --pdg-gray-7: #b1b1b1;
  --pdg-gray-8: #939393;
  --pdg-gray-85: #848484;
  --pdg-gray-9: #767676;
  --pdg-gray-10: #585858;
  --pdg-gray-11: #515151;
  --pdg-black-6: #292929;
  --pdg-blue-6: #0658b0;
  --pdg-blue-11: #ddecfd;
  --pdg-blue-100: #dbeafe;
  --pdg-red-100: #fee2e2;
  --pdg-red-300: #fca5a5;
  --pdg-red-600: #dc2626;
  --pdg-yellow-200: #fef08a;
  --pdg-yellow-400: #facc15;
  --pdg-zinc-200: #e4e4e7;
  --pdg-neutral-500: #737373;
  --pdg-gray-100: #f3f4f6;
  --pdg-scrollbar: #d9d9d9;
  --pdg-success: #2c8440;
  --pdg-error: #dc3545;
  --pdg-overlay: rgba(14, 14, 14, 0.35);

  --erp-main-black: var(--pdg-main-black);
  --erp-main-white: var(--pdg-main-white);
  --erp-gray-3: var(--pdg-gray-3);
  --erp-gray-5: var(--pdg-gray-5);
  --erp-gray-6: var(--pdg-gray-6);
  --erp-gray-7: var(--pdg-gray-7);
  --erp-gray-8: var(--pdg-gray-8);
  --erp-gray-85: var(--pdg-gray-85);
  --erp-gray-9: var(--pdg-gray-9);
  --erp-gray-10: var(--pdg-gray-10);
  --erp-gray-11: var(--pdg-gray-11);
  --erp-black-6: var(--pdg-black-6);
  --erp-blue-6: var(--pdg-blue-6);
  --erp-blue-11: var(--pdg-blue-11);
  --erp-blue-100: var(--pdg-blue-100);
  --erp-red-100: var(--pdg-red-100);
  --erp-red-300: var(--pdg-red-300);
  --erp-red-600: var(--pdg-red-600);
  --erp-yellow-200: var(--pdg-yellow-200);
  --erp-yellow-400: var(--pdg-yellow-400);
  --erp-zinc-200: var(--pdg-zinc-200);
  --erp-neutral-500: var(--pdg-neutral-500);
  --erp-gray-100: var(--pdg-gray-100);
  --erp-scrollbar: var(--pdg-scrollbar);
  --erp-success: var(--pdg-success);
  --erp-error: var(--pdg-error);
  --erp-overlay: var(--pdg-overlay);

  /* Semantic roles (alias to palette — same computed colors as before). */
  --pdg-bg: var(--pdg-main-white);
  --pdg-fg: var(--pdg-black-6);
  --pdg-accent: var(--pdg-blue-6);
  --pdg-range-bg: color-mix(in srgb, var(--pdg-accent) 14%, transparent);
  --pdg-range-border: var(--pdg-accent);
  --pdg-header-bg: var(--pdg-gray-3);
  --pdg-row-stripe: var(--pdg-blue-11);
  --pdg-row-selected: var(--pdg-blue-100);
  --pdg-border: var(--pdg-gray-5);
  --pdg-danger: var(--pdg-red-600);
  --pdg-search-match: var(--pdg-yellow-400);
  --pdg-search-other: var(--pdg-yellow-200);
  --pdg-muted: var(--pdg-neutral-500);
  --pdg-font: IRANSans, Tahoma, sans-serif;
  --pdg-row-height: 40px;
  --pdg-font-size: 12px;
  --pdg-radius: 0.25rem;

  --erp-bg: var(--pdg-bg);
  --erp-fg: var(--pdg-fg);
  --erp-accent: var(--pdg-accent);
  --erp-range-bg: var(--pdg-range-bg);
  --erp-range-border: var(--pdg-range-border);
  --erp-header-bg: var(--pdg-header-bg);
  --erp-row-stripe: var(--pdg-row-stripe);
  --erp-row-selected: var(--pdg-row-selected);
  --erp-border: var(--pdg-border);
  --erp-danger: var(--pdg-danger);
  --erp-search-match: var(--pdg-search-match);
  --erp-search-other: var(--pdg-search-other);
  --erp-muted: var(--pdg-muted);
  --erp-font: var(--pdg-font);
  --erp-row-height: var(--pdg-row-height);
  --erp-font-size: var(--pdg-font-size);
  --erp-radius: var(--pdg-radius);

  font-family: var(--pdg-font);
  color: var(--pdg-fg);
  box-sizing: border-box;
  width: 100%;
}

.erp-table *,
.erp-table *::before,
.erp-table *::after {
  box-sizing: border-box;
}

.erp-table table {
  border-collapse: separate;
  border-spacing: 0;
}
.erp-table .border-collapse { border-collapse: collapse; }

.erp-table .flex { display: flex; }
.erp-table .inline-flex { display: inline-flex; }
.erp-table .flex-col { flex-direction: column; }
.erp-table .flex-1 { flex: 1 1 0%; }
.erp-table .flex-wrap { flex-wrap: wrap; }
.erp-table .shrink-0 { flex-shrink: 0; }
.erp-table .items-center { align-items: center; }
.erp-table .items-start { align-items: flex-start; }
.erp-table .justify-between { justify-content: space-between; }
.erp-table .justify-start { justify-content: flex-start; }
.erp-table .justify-end { justify-content: flex-end; }
.erp-table .justify-center { justify-content: center; }
.erp-table .gap-1 { gap: 0.25rem; }
.erp-table .gap-2 { gap: 0.5rem; }
.erp-table .gap-3 { gap: 0.75rem; }
.erp-table .gap-4 { gap: 1rem; }
.erp-table .gap-5 { gap: 1.25rem; }
.erp-table .w-full { width: 100%; }
.erp-table .h-full { height: 100%; }
.erp-table .h-8 { height: 2rem; }
.erp-table .h-9 { height: var(--erp-row-height); }
.erp-table .h-10 { height: 2.5rem; }
.erp-table .\\!h-9 { height: var(--erp-row-height) !important; }
.erp-table .\\!h-full { height: 100% !important; }
.erp-table .\\!h-\\[480px\\] { height: 480px !important; }
.erp-table .min-w-max { min-width: max-content; }
.erp-table .min-w-0 { min-width: 0; }
.erp-table .min-w-24 { min-width: 6rem; }
.erp-table .min-w-36 { min-width: 9rem; }
.erp-table .min-w-5 { min-width: 1.25rem; }
.erp-table .max-w-72 { max-width: 18rem; }
.erp-table .max-h-\\[20rem\\] { max-height: 20rem; }
.erp-table .max-w-\\[40vw\\] { max-width: 40vw; }
.erp-table .w-2 { width: 0.5rem; }
.erp-table .h-2 { height: 0.5rem; }
.erp-table .w-fit { width: fit-content; }
.erp-table .w-\\[16px\\] { width: 16px; }
.erp-table .h-\\[16px\\] { height: 16px; }
.erp-table .w-\\[20px\\] { width: 20px; }
.erp-table .w-\\[2\\.125rem\\] { width: 2.125rem; }
.erp-table .h-\\[2\\.125rem\\] { height: 2.125rem; }
.erp-table .w-\\[720px\\] { width: 720px; }
.erp-table .min-w-\\[320px\\] { min-width: 320px; }
.erp-table .overflow-auto { overflow: auto; }
.erp-table .overflow-hidden { overflow: hidden; }
.erp-table .overflow-x-auto { overflow-x: auto; }
.erp-table .overflow-y-auto { overflow-y: auto; }
.erp-table .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.erp-table .text-ellipsis { text-overflow: ellipsis; }
.erp-table .whitespace-nowrap { white-space: nowrap; }
.erp-table .text-3xs { font-size: 8px; }
.erp-table .text-xs { font-size: var(--erp-font-size); line-height: 1.25rem; }
.erp-table .text-sm { font-size: 14px; line-height: 1.25rem; }
.erp-table .text-md { font-size: 16px; }
.erp-table .text-start { text-align: start; }
.erp-table .text-center { text-align: center; }
.erp-table .text-white { color: var(--erp-bg); }
.erp-table .font-light { font-weight: 300; }
.erp-table .font-medium { font-weight: 500; }
.erp-table .font-semibold { font-weight: 600; }
.erp-table .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
.erp-table .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.erp-table .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
.erp-table .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.erp-table .py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
.erp-table .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
.erp-table .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.erp-table .p-0 { padding: 0; }
.erp-table .p-1 { padding: 0.25rem; }
.erp-table .p-1\\.5 { padding: 0.375rem; }
.erp-table .p-2 { padding: 0.5rem; }
.erp-table .p-3 { padding: 0.75rem; }
.erp-table .pb-24 { padding-bottom: 6rem; }
.erp-table .pt-5 { padding-top: 1.25rem; }
.erp-table .m-0 { margin: 0; }
.erp-table .m-12 { margin: 3rem; }
.erp-table .my-1 { margin-top: 0.25rem; margin-bottom: 0.25rem; }
.erp-table .ms-auto { margin-inline-start: auto; }
.erp-table .start-1 { inset-inline-start: 0.25rem; }
.erp-table .border { border-width: 1px; border-style: solid; border-color: var(--erp-border); }
.erp-table .border-0 { border-width: 0; }
.erp-table .border-b { border-bottom: 1px solid var(--erp-border); }
.erp-table .border-t { border-top: 1px solid var(--erp-border); }
.erp-table .border-dashed { border-style: dashed; }
.erp-table .rounded { border-radius: var(--erp-radius); }
.erp-table .rounded-t-lg { border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem; }
.erp-table .rounded-lg { border-radius: 0.5rem; }
.erp-table .rounded-full { border-radius: 9999px; }
.erp-table .rounded-sm { border-radius: 0.125rem; }
.erp-table .sticky { position: sticky; }
.erp-table .absolute { position: absolute; }
.erp-table .relative { position: relative; }
.erp-table .fixed { position: fixed; }
.erp-table .inset-0 { inset: 0; }
.erp-table .top-0 { top: 0; }
.erp-table .top-1 { top: 0.25rem; }
.erp-table .right-0 { right: 0; }
.erp-table .left-0 { left: 0; }
.erp-table .z-10 { z-index: 10; }
.erp-table .z-20 { z-index: 20; }
.erp-table .shadow { box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
.erp-table .shadow-lg { box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1); }
.erp-table .transition-all { transition: all 0.2s ease; }
.erp-table .transition-colors { transition: color 0.15s ease, background-color 0.15s ease; }
.erp-table .duration-200 { transition-duration: 200ms; }
.erp-table .duration-300 { transition-duration: 300ms; }
.erp-table .duration-400 { transition-duration: 400ms; }
.erp-table .cursor-pointer { cursor: pointer; }
.erp-table .cursor-text { cursor: text; }
.erp-table .cursor-not-allowed { cursor: not-allowed; }
.erp-table .cursor-grab { cursor: grab; }
.erp-table .cursor-grabbing,
.erp-table .active\\:cursor-grabbing:active { cursor: grabbing; }
.erp-table .cursor-wait { cursor: wait; }
.erp-table .cursor-col-resize { cursor: col-resize; }
.erp-table .opacity-30 { opacity: 0.3; }
.erp-table .opacity-40 { opacity: 0.4; }
.erp-table .opacity-50 { opacity: 0.5; }
.erp-table .opacity-60 { opacity: 0.6; }
.erp-table .opacity-100 { opacity: 1; }
.erp-table .line-through { text-decoration: line-through; }
.erp-table .bg-transparent { background-color: transparent; }
.erp-table .outline-none,
.erp-table .focus\\:outline-none:focus,
.erp-table .focus-visible\\:outline-none:focus-visible { outline: none; }
.erp-table .ring-0,
.erp-table .focus\\:ring-0:focus,
.erp-table .focus\\:\\!ring-0:focus { box-shadow: none !important; }
.erp-table .ring-2 { box-shadow: 0 0 0 2px var(--erp-search-match); }
.erp-table .ring-yellow-400 { --tw-ring-color: var(--erp-search-match); }
.erp-table .bg-main-white { background-color: var(--erp-bg); }
.erp-table .bg-main-black { background-color: var(--erp-main-black); }
.erp-table .bg-gray-gray3 { background-color: var(--erp-header-bg); }
.erp-table .bg-gray-gray5,
.erp-table .\\!bg-gray-gray5 { background-color: var(--erp-gray-5) !important; }
.erp-table .bg-gray-100 { background-color: var(--erp-gray-100); }
.erp-table .bg-blue-100 { background-color: var(--erp-row-selected); }
.erp-table .bg-blue-blue11 { background-color: var(--erp-row-stripe); }
.erp-table .bg-blue-blue6 { background-color: var(--erp-accent); }
.erp-table .bg-red-300 { background-color: var(--erp-red-300); }
.erp-table .bg-red-600 { background-color: var(--erp-danger); }
.erp-table .bg-white,
.erp-table .\\!bg-white { background-color: var(--erp-bg) !important; }
.erp-table .text-main-white { color: var(--erp-main-white); }
.erp-table .text-main-black { color: var(--erp-main-black); }
.erp-table .text-gray-gray3 { color: var(--erp-gray-3); }
.erp-table .text-gray-gray7 { color: var(--erp-gray-7); }
.erp-table .text-gray-gray9 { color: var(--erp-gray-9); }
.erp-table .text-gray-gray10 { color: var(--erp-gray-10); }
.erp-table .stroke-gray-gray3 { stroke: var(--erp-gray-3); }
.erp-table .stroke-gray-gray6 { stroke: var(--erp-gray-6); }
.erp-table .stroke-gray-gray10 { stroke: var(--erp-gray-10); }
.erp-table .stroke-gray-gray85 { stroke: var(--erp-gray-85); }
.erp-table .fill-gray-gray6 { fill: var(--erp-gray-6); }
.erp-table .fill-gray-gray7 { fill: var(--erp-gray-7); }
.erp-table .fill-gray-gray8 { fill: var(--erp-gray-8); }
.erp-table .fill-gray-gray10 { fill: var(--erp-gray-10); }
.erp-table .fill-white { fill: var(--erp-bg); }
.erp-table .text-black-black6 { color: var(--erp-fg); }
.erp-table .text-blue-blue6 { color: var(--erp-accent); }
.erp-table .text-red-600 { color: var(--erp-danger); }
.erp-table .text-neutral-500 { color: var(--erp-muted); }
.erp-table .border-gray-gray5 { border-color: var(--erp-border); }
.erp-table .border-gray-gray7,
.erp-table .\\!border-gray-gray7 { border-color: var(--erp-gray-7) !important; }
.erp-table .border-gray-gray8 { border-color: var(--erp-gray-8); }
.erp-table .border-gray-gray5 { border-color: var(--erp-border); }
.erp-table .\\!border-\\[0\\.4px\\] { border-width: 0.4px !important; }
.erp-table .hover\\:bg-red-100:hover { background-color: var(--erp-red-100); }
.erp-table .hover\\:bg-zinc-200:hover { background-color: var(--erp-zinc-200); }
.erp-table .disabled\\:opacity-40:disabled { opacity: 0.4; }
.erp-table .animate-spin { animation: erp-table-spin 0.8s linear infinite; }
.erp-table .bg-yellow-400 { background-color: var(--erp-search-match); }
.erp-table .bg-yellow-200 { background-color: var(--erp-search-other); }
.erp-table mark.bg-yellow-400 { background-color: var(--erp-search-match); font-weight: 600; }
.erp-table mark.bg-yellow-200 { background-color: var(--erp-search-other); }
.erp-table mark.erp-search-hit {
  background-color: var(--erp-search-other);
  color: inherit;
}
.erp-table mark.erp-search-hit.is-current {
  background-color: var(--erp-search-match);
  font-weight: 600;
}
.erp-table tfoot.erp-table-footer tr {
  background-color: var(--erp-bg);
  border-color: var(--erp-border);
  color: var(--erp-fg);
  height: var(--erp-row-height);
}
.erp-table tfoot.erp-table-footer td {
  color: var(--erp-fg);
  font-variant-numeric: tabular-nums;
}

/* PR-116: pinned top/bottom rows — sticky within the scrollport */
.erp-table tbody.erp-pinned-rows--top {
  position: sticky;
  top: var(--erp-pinned-top-offset, var(--erp-row-height, 40px));
  z-index: 15;
}
.erp-table tbody.erp-pinned-rows--top tr.erp-pinned-row {
  background-color: var(--pdg-bg, var(--erp-bg));
  box-shadow: 0 1px 0 var(--pdg-border, var(--erp-border));
}
.erp-table tbody.erp-pinned-rows--bottom {
  position: sticky;
  bottom: var(--erp-pinned-bottom-offset, 0px);
  z-index: 15;
}
.erp-table tbody.erp-pinned-rows--bottom tr.erp-pinned-row {
  background-color: var(--pdg-bg, var(--erp-bg));
  box-shadow: 0 -1px 0 var(--pdg-border, var(--erp-border));
}
.erp-table tbody.erp-pinned-rows td {
  background-color: inherit;
  font-variant-numeric: tabular-nums;
}
.erp-table tbody.erp-pinned-rows .erp-col-pin-start,
.erp-table tbody.erp-pinned-rows .erp-col-pin-index,
.erp-table tbody.erp-pinned-rows .erp-col-pin-end {
  z-index: 16;
}

.erp-table .hidden-show-scrollBar {
  scrollbar-width: thin;
  scrollbar-color: var(--erp-scrollbar) transparent;
}
.erp-table .hidden-show-scrollBar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.erp-table .hidden-show-scrollBar::-webkit-scrollbar-thumb {
  background: var(--erp-scrollbar);
  border-radius: 999px;
}

.erp-table .\\[overflow-anchor\\:none\\] { overflow-anchor: none; }

.erp-table input,
.erp-table select,
.erp-table button {
  font-family: inherit;
}

.erp-table th,
.erp-table td {
  vertical-align: middle;
}

@keyframes erp-table-spin {
  to { transform: rotate(360deg); }
}

/* Pagination (ERP antd look) */
.erp-table-pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--erp-font-size);
}
.erp-table-pagination__pages {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.erp-table-pagination__page {
  min-width: 1.75rem;
  height: 1.75rem;
  padding: 0 0.4rem;
  border: 1px solid var(--erp-border);
  border-radius: var(--erp-radius);
  background: var(--erp-bg);
  cursor: pointer;
}
.erp-table-pagination__page.is-active {
  border-color: var(--erp-main-black);
  color: var(--erp-main-black);
  font-weight: 600;
}
.erp-table-pagination__page.is-active:hover {
  background: var(--erp-main-black);
  color: var(--erp-bg);
}
.erp-table-pagination__nav {
  display: inline-flex;
  margin: 0;
  padding: 0;
  border-radius: var(--erp-radius);
  width: fit-content;
  border: 1px solid var(--erp-border);
  background: var(--erp-bg);
  cursor: pointer;
}
.erp-table-pagination__nav:hover {
  border-color: var(--erp-main-black);
}
.erp-table-pagination__nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.erp-table-pagination select {
  height: 1.75rem;
  min-width: 3.25rem;
  padding: 0 0.4rem;
  border: 1px solid var(--erp-border);
  border-radius: var(--erp-radius);
  background: var(--erp-bg);
  font-size: var(--erp-font-size);
  color: var(--erp-fg);
  cursor: pointer;
}

/* Modal */
.erp-table-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 11000;
  background: var(--erp-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

/* Cell range selection (PR-105) */
.pdg-cell-range {
  background: var(--pdg-range-bg, var(--erp-range-bg));
}
.pdg-cell-range[data-pdg-range-edge~='top'] {
  box-shadow: inset 0 2px 0 0 var(--pdg-range-border, var(--erp-range-border));
}
.pdg-cell-range[data-pdg-range-edge~='bottom'] {
  box-shadow: inset 0 -2px 0 0 var(--pdg-range-border, var(--erp-range-border));
}
.pdg-cell-range[data-pdg-range-edge~='left'] {
  box-shadow: inset 2px 0 0 0 var(--pdg-range-border, var(--erp-range-border));
}
.pdg-cell-range[data-pdg-range-edge~='right'] {
  box-shadow: inset -2px 0 0 0 var(--pdg-range-border, var(--erp-range-border));
}

/* Fill handle (PR-108) */
.pdg-fill-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 2;
  width: 7px;
  height: 7px;
  margin: 0;
  padding: 0;
  border: 1px solid var(--pdg-range-border, var(--erp-range-border));
  background: var(--pdg-accent, var(--erp-accent));
  cursor: crosshair;
  touch-action: none;
}

/* Grid body overlays (PR-103) */
.pdg-overlay {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: color-mix(in srgb, var(--pdg-bg, var(--erp-bg)) 82%, transparent);
  color: var(--pdg-fg, var(--erp-fg));
}
.pdg-overlay[data-pdg-overlay='loading'] {
  pointer-events: auto;
}
.pdg-overlay__panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  font-size: var(--pdg-font-size, var(--erp-font-size));
  color: var(--pdg-muted, var(--erp-muted, var(--pdg-gray-9)));
}
.pdg-row-skeleton {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: calc(var(--pdg-row-height, 40px) - 8px);
  padding: 0 0.5rem;
  box-sizing: border-box;
}
.pdg-row-skeleton__bar {
  display: block;
  width: 70%;
  height: 0.55rem;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    var(--pdg-gray-5) 0%,
    var(--pdg-gray-3) 45%,
    var(--pdg-gray-5) 90%
  );
  background-size: 200% 100%;
  animation: pdg-skeleton-shimmer 1.2s ease-in-out infinite;
}
.pdg-grid[data-erp-theme='dark'] .pdg-row-skeleton__bar {
  background: linear-gradient(
    90deg,
    var(--pdg-gray-7) 0%,
    var(--pdg-gray-6) 45%,
    var(--pdg-gray-7) 90%
  );
  background-size: 200% 100%;
}
@keyframes pdg-skeleton-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}

.erp-table-modal {
  background: var(--erp-bg);
  border-radius: 0.5rem;
  width: min(720px, 100%);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 48px rgba(10, 21, 64, 0.18);
}
.erp-table-modal__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--erp-border);
  font-size: 14px;
}
.erp-table-modal__body {
  padding: 0.5rem;
  overflow: auto;
  flex: 1;
}
.erp-table-modal__close {
  margin-inline-start: auto;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 1.1rem;
}

/* Dropdown / tooltip / select */
.erp-table-tooltip {
  position: absolute;
  z-index: 12000;
  background: var(--erp-black-6);
  color: var(--erp-bg);
  font-size: 11px;
  padding: 0.25rem 0.5rem;
  border-radius: var(--erp-radius);
  pointer-events: none;
  white-space: nowrap;
}
.erp-table-dropdown {
  position: absolute;
  z-index: 12000;
  background: var(--erp-bg);
  border: 1px solid var(--erp-border);
  border-radius: 0.375rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  min-width: 10rem;
  max-height: 20rem;
  overflow: auto;
  padding: 0.25rem 0;
}
.erp-table-dropdown__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  padding: 0.4rem 0.75rem;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-size: 13px;
  text-align: start;
}
.erp-table-dropdown__item:hover { background: var(--erp-header-bg); }
.erp-table-dropdown__divider {
  height: 1px;
  background: var(--erp-border);
  margin: 0.25rem 0;
}

.erp-table-select {
  position: relative;
  width: 100%;
  height: 2.25rem;
}
.erp-table-select__control {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
  padding: 0 0.5rem;
  border: 0.4px solid var(--erp-gray-7);
  border-radius: var(--erp-radius);
  background: var(--erp-bg);
  font-size: var(--erp-font-size);
  cursor: pointer;
}
.erp-table-select__control.is-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.erp-table-select__menu {
  position: absolute;
  z-index: 13000;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  background: var(--erp-bg);
  border: 1px solid var(--erp-border);
  border-radius: 0.375rem;
  max-height: 16rem;
  overflow: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
.erp-table-select__option {
  padding: 0.4rem 0.75rem;
  font-size: var(--erp-font-size);
  cursor: pointer;
}
.erp-table-select__option:hover,
.erp-table-select__option.is-active {
  background: var(--erp-row-stripe);
}
.erp-table-select__search {
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--erp-border);
  padding: 0.4rem 0.5rem;
  font-size: var(--erp-font-size);
  outline: none;
}

.erp-table-checkbox {
  appearance: none;
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  min-width: 16px;
  margin: 0;
  border: 1px solid var(--erp-scrollbar);
  border-radius: 4px;
  background: var(--erp-bg);
  cursor: pointer;
  display: inline-block;
  position: relative;
  vertical-align: middle;
  flex-shrink: 0;
}
.erp-table-checkbox:checked {
  background: var(--erp-main-black);
  border-color: var(--erp-main-black);
}
.erp-table-checkbox:checked::after {
  content: '';
  position: absolute;
  inset-inline-start: 4px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: 2px solid var(--erp-bg);
  border-top: 0;
  border-inline-start: 0;
  transform: rotate(45deg);
}
.erp-table-checkbox:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.erp-table-toast {
  position: fixed;
  z-index: 14000;
  bottom: 1.25rem;
  inset-inline-end: 1.25rem;
  padding: 0.6rem 0.9rem;
  border-radius: 0.4rem;
  font-size: var(--erp-font-size);
  color: var(--erp-bg);
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.1);
}
.erp-table-toast.is-success { background: var(--erp-success); }
.erp-table-toast.is-error { background: var(--erp-error); }

.erp-table-date {
  width: 100%;
  height: 100%;
}
.erp-table-date .erp-table-select__control,
.erp-table-date input {
  height: 2.25rem;
  width: 100%;
  background: var(--erp-header-bg);
  border: none;
  border-radius: 0.125rem;
  font-size: var(--erp-font-size);
  padding: 0 0.5rem;
}

.erp-table-desktop__toolbar {
  padding: 0.5rem 0.25rem 0.35rem;
}

.erp-table-index-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 0;
  padding: 0.125rem;
  border-radius: 0.125rem;
  cursor: pointer;
  line-height: 0;
}

.erp-table th[data-pdg-sortable='true'] {
  cursor: pointer;
  user-select: none;
}

.erp-table .pdg-header-label {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 0;
  max-width: calc(100% - 0.5rem);
}

.erp-table .pdg-header-caption {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.erp-table .pdg-sort-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  flex-shrink: 0;
  color: var(--pdg-accent, var(--erp-accent));
  font-size: 0.65rem;
  line-height: 1;
}

.erp-table .pdg-sort-icon {
  opacity: 0.9;
}

.erp-table .pdg-sort-priority {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 0.9rem;
  padding-inline: 0.15rem;
  border-radius: 0.2rem;
  background: color-mix(in srgb, var(--pdg-accent, var(--erp-accent)) 18%, transparent);
  color: var(--pdg-accent, var(--erp-accent));
  font-size: 0.6rem;
  font-weight: 600;
}

.erp-table .pdg-filter-btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-inline-start: 0.15rem;
  padding: 0.05rem 0.2rem;
  border: 0;
  border-radius: 0.2rem;
  background: transparent;
  color: var(--pdg-fg-muted, var(--erp-fg-muted));
  font-size: 0.55rem;
  line-height: 1;
  cursor: pointer;
}

.erp-table .pdg-filter-btn-icon.is-active,
.erp-table th[data-pdg-filter-active='true'] .pdg-filter-btn-icon {
  color: var(--pdg-accent, var(--erp-accent));
  background: color-mix(in srgb, var(--pdg-accent, var(--erp-accent)) 16%, transparent);
}

.pdg-filter-popover {
  min-width: 12rem;
  max-width: 18rem;
  padding: 0.5rem;
  border: 1px solid var(--pdg-border, var(--erp-border));
  border-radius: 0.375rem;
  background: var(--pdg-bg, var(--erp-bg));
  color: var(--pdg-fg, var(--erp-fg));
  box-shadow: 0 8px 24px color-mix(in srgb, var(--pdg-fg, var(--erp-fg)) 18%, transparent);
}

.pdg-filter-form {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.pdg-filter-select,
.pdg-filter-input,
.pdg-floating-filter-input {
  width: 100%;
  min-height: 1.75rem;
  padding: 0.2rem 0.35rem;
  border: 1px solid var(--pdg-border, var(--erp-border));
  border-radius: 0.25rem;
  background: var(--pdg-bg, var(--erp-bg));
  color: inherit;
  font-size: 0.75rem;
}

.pdg-filter-actions {
  display: flex;
  gap: 0.35rem;
  justify-content: flex-end;
}

.pdg-filter-btn {
  padding: 0.2rem 0.45rem;
  border: 1px solid var(--pdg-border, var(--erp-border));
  border-radius: 0.25rem;
  background: color-mix(in srgb, var(--pdg-accent, var(--erp-accent)) 12%, transparent);
  color: inherit;
  font-size: 0.7rem;
  cursor: pointer;
}

.pdg-filter-check {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
}

.pdg-filter-set-list {
  max-height: 10rem;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.erp-table .pdg-floating-filter-row {
  background: var(--pdg-bg-muted, var(--erp-bg-muted));
}

.erp-table .pdg-floating-filter-cell {
  padding: 0.25rem;
  border: 1px solid var(--pdg-border, var(--erp-border));
  font-weight: normal;
}

.erp-table .erp-col-resize {
  position: absolute;
  inset-block: 0;
  inset-inline-end: 0;
  width: 6px;
  padding: 0;
  margin: 0;
  border: 0;
  background: transparent;
  cursor: col-resize;
  touch-action: none;
  z-index: 2;
}

.erp-table .erp-col-resize:hover,
.erp-table .erp-col-resize:focus-visible {
  background: var(--erp-accent);
  opacity: 0.35;
}

body.erp-col-resizing,
body.erp-col-resizing * {
  cursor: col-resize;
  user-select: none;
}

.erp-table th[data-erp-col-drag] {
  cursor: grab;
}

.erp-table th[data-erp-col-drop] {
  box-shadow: inset 0 0 0 2px var(--erp-accent);
}

.erp-table .erp-col-group-header {
  font-weight: 600;
  vertical-align: middle;
}

.erp-table .erp-col-group-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  font: inherit;
  color: inherit;
  padding: 0;
}

.pdg-col-menu-btn {
  margin-inline-start: 0.25rem;
  padding: 0 0.25rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.875rem;
  line-height: 1;
  color: var(--pdg-muted, var(--erp-muted));
}

.pdg-col-menu-btn:hover {
  color: var(--pdg-accent, inherit);
}

.erp-col-menu {
  min-width: 11rem;
  padding: 0.25rem 0;
  border: 1px solid var(--pdg-border, var(--erp-border));
  border-radius: 0.375rem;
  background: var(--pdg-bg, var(--erp-bg));
  color: var(--pdg-fg, var(--erp-fg));
  box-shadow: 0 8px 24px color-mix(in srgb, var(--pdg-fg, var(--erp-fg)) 18%, transparent);
}

.erp-col-menu__item {
  display: block;
  width: 100%;
  padding: 0.375rem 0.75rem;
  border: none;
  background: transparent;
  text-align: start;
  font: inherit;
  font-size: 0.75rem;
  cursor: pointer;
  color: inherit;
}

.erp-col-menu__item:hover,
.erp-col-menu__item.is-focused {
  background: color-mix(in srgb, var(--pdg-accent, var(--erp-accent)) 12%, transparent);
}

.erp-col-menu__item:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.erp-col-menu__separator {
  height: 1px;
  margin: 0.25rem 0;
  background: var(--pdg-border, var(--erp-border));
}

.erp-col-columns-panel__title {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-bottom: 1px solid var(--pdg-border, var(--erp-border));
}

.erp-col-columns-panel__list {
  list-style: none;
  margin: 0;
  padding: 0.25rem 0;
  max-height: 16rem;
  overflow: auto;
}

.erp-col-columns-panel__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  cursor: pointer;
}

.erp-col-columns-panel__row:hover {
  background: color-mix(in srgb, var(--pdg-accent, var(--erp-accent)) 12%, transparent);
}

.erp-table .erp-col-pin-start,
.erp-table .erp-col-pin-index {
  position: sticky;
  z-index: 2;
  background-color: inherit;
}

.erp-table .erp-col-pin-end {
  position: sticky;
  z-index: 2;
  background-color: inherit;
}

.erp-table thead .erp-col-pin-start,
.erp-table thead .erp-col-pin-index,
.erp-table thead .erp-col-pin-end {
  z-index: 4;
  background-color: var(--erp-header-bg);
}

.erp-table tfoot .erp-col-pin-start,
.erp-table tfoot .erp-col-pin-index,
.erp-table tfoot .erp-col-pin-end {
  z-index: 3;
  background-color: var(--erp-bg);
}

.erp-table[dir="ltr"] .erp-col-pin-start,
.erp-table[dir="ltr"] .erp-col-pin-index {
  box-shadow: 4px 0 8px -6px rgb(0 0 0 / 0.22);
}

.erp-table[dir="rtl"] .erp-col-pin-start,
.erp-table[dir="rtl"] .erp-col-pin-index {
  box-shadow: -4px 0 8px -6px rgb(0 0 0 / 0.22);
}

.erp-table[dir="ltr"] .erp-col-pin-end {
  box-shadow: -4px 0 8px -6px rgb(0 0 0 / 0.22);
}

.erp-table[dir="rtl"] .erp-col-pin-end {
  box-shadow: 4px 0 8px -6px rgb(0 0 0 / 0.22);
}

.erp-table .erp-toolbar-btn:focus-visible {
  outline: 2px solid var(--erp-accent);
  outline-offset: 2px;
}

/* PR-124: cell editors expose a visible focus ring (APG). */
.erp-table .pdg-cell-editor:focus-visible,
.pdg-grid .pdg-cell-editor:focus-visible {
  outline: 2px solid var(--pdg-accent, var(--erp-accent));
  outline-offset: 1px;
}

/* PR-125: polite announcements for AT; keep out of visual layout. */
.pdg-live-region {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* PR-136: product audit history panel */
.pdg-history-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 220px;
  max-width: 360px;
  max-height: 100%;
  padding: 10px;
  border: 1px solid var(--pdg-border, var(--erp-border));
  border-radius: 6px;
  background: var(--pdg-bg, var(--erp-bg));
  color: var(--pdg-fg, var(--erp-fg));
  font-size: 12px;
  box-sizing: border-box;
}
.pdg-history-panel__header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pdg-history-panel__title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}
.pdg-history-panel__filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.pdg-history-panel__filter {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pdg-history-panel__filter select {
  font: inherit;
  padding: 4px 6px;
  border: 1px solid var(--pdg-border, var(--erp-border));
  border-radius: 4px;
  background: var(--pdg-bg, var(--erp-bg));
  color: inherit;
}
.pdg-history-panel__empty {
  margin: 0;
  opacity: 0.7;
}
.pdg-history-panel__list {
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pdg-history-panel__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid var(--pdg-border, var(--erp-border));
  border-radius: 4px;
  padding: 6px;
  background: var(--pdg-bg-muted, var(--erp-bg-muted));
}
.pdg-history-panel__item[data-pdg-history-severity='warning'] {
  border-color: var(--pdg-warning, var(--erp-warning, var(--erp-accent)));
}
.pdg-history-panel__item[data-pdg-history-severity='error'] {
  border-color: var(--pdg-danger, var(--erp-danger));
}
.pdg-history-panel__jump {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: inherit;
  font: inherit;
  cursor: pointer;
}
.pdg-history-panel__jump:disabled {
  cursor: default;
  opacity: 0.85;
}
.pdg-history-panel__jump:not(:disabled):hover .pdg-history-panel__item-title {
  color: var(--pdg-accent, var(--erp-accent));
}
.pdg-history-panel__item-title {
  font-weight: 600;
}
.pdg-history-panel__item-meta {
  opacity: 0.65;
  font-size: 11px;
}
.pdg-history-panel__item-desc {
  opacity: 0.85;
}
.pdg-history-panel__restore {
  align-self: flex-start;
  font: inherit;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid var(--pdg-border, var(--erp-border));
  background: var(--pdg-bg, var(--erp-bg));
  color: var(--pdg-accent, var(--erp-accent));
  cursor: pointer;
}
.pdg-history-panel__restore:hover {
  border-color: var(--pdg-accent, var(--erp-accent));
}

/* PR-137: offline / pending mutations status */
.pdg-offline-status {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--pdg-border, var(--erp-border));
  border-radius: 6px;
  background: var(--pdg-bg-muted, var(--erp-bg-muted));
  color: var(--pdg-fg, var(--erp-fg));
  font-size: 12px;
}
.pdg-offline-status[data-pdg-connectivity='offline'] {
  border-color: var(--pdg-warning, var(--erp-warning, var(--erp-accent)));
}
.pdg-offline-status__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.pdg-offline-status__badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 11px;
  background: color-mix(in srgb, var(--pdg-accent, var(--erp-accent)) 16%, transparent);
}
.pdg-offline-status[data-pdg-connectivity='offline'] .pdg-offline-status__badge {
  background: color-mix(
    in srgb,
    var(--pdg-warning, var(--erp-warning, var(--erp-accent))) 22%,
    transparent
  );
}
.pdg-offline-status__pending {
  opacity: 0.9;
}
.pdg-offline-status__queue {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 8rem;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pdg-offline-status__queue li {
  padding: 4px 6px;
  border-radius: 4px;
  background: var(--pdg-bg, var(--erp-bg));
  border: 1px solid var(--pdg-border, var(--erp-border));
}

.pdg-sync-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--pdg-border, var(--erp-border));
  border-radius: 6px;
  background: var(--pdg-surface, var(--erp-surface));
  color: var(--pdg-text, var(--erp-text));
  font-size: 0.875rem;
}
.pdg-sync-panel__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.pdg-sync-panel__policy {
  display: flex;
  align-items: center;
  gap: 6px;
}
.pdg-sync-panel__policy select,
.pdg-sync-panel button {
  font: inherit;
  color: inherit;
  background: var(--pdg-bg, var(--erp-bg));
  border: 1px solid var(--pdg-border, var(--erp-border));
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
}
.pdg-sync-panel button:disabled,
.pdg-sync-panel select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.pdg-sync-panel__status {
  margin: 0;
  opacity: 0.85;
}
.pdg-sync-panel__conflicts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pdg-sync-panel__conflicts li {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 6px 8px;
  border-radius: 4px;
  background: var(--pdg-bg, var(--erp-bg));
  border: 1px solid var(--pdg-border, var(--erp-border));
}
.pdg-sync-panel__conflict-key {
  font-weight: 600;
  color: var(--pdg-accent, var(--erp-accent));
}
.pdg-sync-panel__conflict-actions {
  display: flex;
  gap: 6px;
  margin-inline-start: auto;
}

.pdg-presence-panel {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid var(--pdg-border, var(--erp-border));
  border-radius: 6px;
  background: var(--pdg-surface, var(--erp-surface));
  color: var(--pdg-text, var(--erp-text));
  font-size: 0.875rem;
}
.pdg-presence-panel__title {
  font-weight: 600;
}
.pdg-presence-panel__empty {
  margin: 0;
  opacity: 0.75;
}
.pdg-presence-panel__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pdg-presence-panel__list li {
  display: flex;
  align-items: center;
  gap: 8px;
}
.pdg-presence-panel__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.pdg-presence-panel__cell {
  opacity: 0.8;
  margin-inline-start: auto;
}

`;

export function injectGridStyles(): void {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = CSS;
  document.head.appendChild(el);
}

/** @deprecated Use `injectGridStyles()` (PR-77 / D16). */
export function injectERPTableStyles(): void {
  injectGridStyles();
}
