import { LiveGridPreview } from './LiveGridPreview';

/**
 * Grid chrome only — voucher «اقلام سند» look.
 * Page chrome (demo / landing) stays outside this component.
 */
export function ERPTableChromePreview() {
  return (
    <LiveGridPreview
      tableKey="demo-erp-table-chrome"
      tableHeight={400}
      tableTitle="اقلام سند"
    />
  );
}

export default function ERPTablePlayground() {
  return <ERPTableChromePreview />;
}
