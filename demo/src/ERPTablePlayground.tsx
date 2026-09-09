import { useMemo, useState } from 'react';

import {
  ERPTable,
  type IMultiSelectConfig,
  type UITableController,
} from '@fallahi/erp-table';

import {
  buildVoucherDemoRows,
  VOUCHER_COLUMNS,
} from './fixtures';
import { DemoMockRemoteApi } from './mockRemoteApi';
import styles from './site.module.css';

const remoteApi = new DemoMockRemoteApi(80);

const multiSelectConfig: IMultiSelectConfig = {
  dynamicValue: { endpoint: '/api/demo/select/account' },
  fieldKey: '_SelectId',
  detailFieldKey: 'id',
  onAdd: () => undefined,
  ListConfig: [
    { fieldName: 'index', fieldCaption: '#', fieldType: 'index' },
    {
      fieldName: '_SelectDisplay',
      fieldCaption: 'سرفصل حساب',
      fieldType: 'text',
    },
  ],
};

/**
 * ERPTable chrome only — voucher «اقلام سند» look.
 * Page chrome (demo / landing) stays outside this component.
 */
export function ERPTableChromePreview() {
  const [controller, setController] = useState<UITableController | null>(null);
  const rows = useMemo(() => buildVoucherDemoRows(), []);
  const columns = useMemo(() => VOUCHER_COLUMNS, []);

  return (
    <div className={styles.erpHost} dir="rtl">
      <div className={styles.erpHostMeta}>
        <span className={styles.chip}>
          {controller ? 'ready' : 'booting…'}
        </span>
      </div>
      <ERPTable
        actor={{ userId: 'demo', roles: ['admin'] }}
        store="demo-store"
        tableKey="demo-erp-table-chrome"
        rows={rows}
        columns={columns}
        tableHeight={400}
        recordPerPage={9}
        tableTitle="اقلام سند"
        virtualization={false}
        remoteApi={remoteApi}
        locale="fa"
        multiSelectConfig={multiSelectConfig}
        onReady={setController}
      />
    </div>
  );
}

export default function ERPTablePlayground() {
  return <ERPTableChromePreview />;
}
