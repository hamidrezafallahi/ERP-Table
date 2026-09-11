import React from 'react';

import { ERPTable } from './index';

// PR-55: host may replace checkbox via components; other FieldTypes stay built-in.
export function CheckboxOverrideSample(): React.ReactElement {
  return (
    <ERPTable
      store="erp"
      tableKey="checkbox-override"
      actor={{ userId: 'u1', roles: ['admin'] }}
      components={{
        checkbox: (ctx) => (
          <input
            data-erp-cell-component="checkbox"
            type="checkbox"
            checked={ctx.value === true}
            onChange={(e) => ctx.dispatchChangeValue(e.target.checked)}
          />
        ),
      }}
      columns={[
        {
          fieldName: 'ok',
          fieldCaption: 'OK',
          fieldType: 'checkbox',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
        {
          fieldName: 'note',
          fieldCaption: 'Note',
          fieldType: 'textArea',
          fieldCollection: 'default',
          visibility: { kind: 'always' },
        },
      ]}
      rows={[{ id: 1, collection: 'default', values: { ok: true, note: 'a\nb' } }]}
    />
  );
}
