import { ERPTable, type ERPTableProps, useERPTable, themeErp, themeErpDark } from 'persian-data-grid';
import { createERPTable } from 'persian-data-grid';
import { injectERPTableStyles } from 'persian-data-grid';

type Line = { id: string; name: string };

const props: ERPTableProps<Line> = {
  columnDefs: [{ field: 'name' }],
  rowData: [{ id: '1', name: 'alpha' }],
  theme: themeErp.withParams({ accentColor: themeErpDark.params.accentColor }),
};

export function Host() {
  const grid = useERPTable(props);
  return <ERPTable {...props} />;
}

void createERPTable;
void injectERPTableStyles;
