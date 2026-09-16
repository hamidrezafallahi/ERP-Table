import type { FilterComponent, FilterComponentMap } from './filters';

// PR-95: host may register custom filter UIs via filterComponents.
const RoundAmount: FilterComponent = ({ apply, close, params }) => {
  void params;
  return (
    <button
      type="button"
      onClick={() => {
        apply({
          filterType: 'custom',
          type: 'roundAmount',
          customFilter: (v) => Number(v) % 1_000_000 === 0,
        });
        close();
      }}
    >
      فقط مبالغ رُند
    </button>
  );
};

export const demoFilters: FilterComponentMap = {
  roundAmount: RoundAmount,
};
