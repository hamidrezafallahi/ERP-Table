import {
  ERPTable,
  type ERPTableProps,
  useERPTable,
  themeErp,
  themeErpDark,
  createERPTable,
  injectERPTableStyles,
  FetchRemoteApi,
  ExcelExportPlugin,
  UITableController,
} from 'persian-data-grid';

type Line = { id: string; name: string };

const props: ERPTableProps<Line> = {
  columnDefs: [{ field: 'name' }],
  rowData: [{ id: '1', name: 'alpha' }],
  theme: themeErp.withParams({ accentColor: themeErpDark.params.accentColor }),
  remoteApi: new FetchRemoteApi(),
};

export async function boot() {
  injectERPTableStyles();
  const table = await createERPTable({
    columnDefs: props.columnDefs,
    rowData: props.rowData,
  });
  void table.session;
  void ExcelExportPlugin;
  void UITableController;
  return table;
}

export function Host() {
  const grid = useERPTable(props);
  void grid;
  return <ERPTable {...props} />;
}

/* Host shortcut docs still mention Alt+C for clipboard */
void 'Alt+C';
