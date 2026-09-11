import React from 'react';

import { ERPTable } from './index';

// PR-53 / D11: ERPTable must typecheck without multiSelectConfig.
export function OptionalMultiSelectSample(): React.ReactElement {
  return (
    <ERPTable
      store="erp"
      tableKey="optional-multiselect"
      actor={{ userId: 'u1', roles: ['admin'] }}
      columns={[
        {
          fieldName: 'name',
          fieldCaption: 'Name',
          fieldType: 'text',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ]}
      rows={[{ id: 1, collection: 'default', values: { name: 'a' } }]}
    />
  );
}
