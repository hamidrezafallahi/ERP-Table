/**
 * Ambient stubs kept only for modules that package UI / tests still resolve.
 * ERP host page glue (`useERPGrid`, `useVoucherDescription`) lives under
 * `examples/host-arian-erp/` and is outside the package typecheck graph.
 *
 * Prefer real `@types/*` when available (e.g. `@types/react-dom` for portals).
 */

/** Legacy mock target used by older vitest files; not imported by product code. */
declare module '@services/customBaseQuery' {
  export function baseQueryByToken(
    args: unknown,
    api: unknown,
    extra: unknown,
  ): Promise<unknown>;
}
