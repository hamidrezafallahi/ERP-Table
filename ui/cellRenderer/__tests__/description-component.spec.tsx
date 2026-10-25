/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { cleanup, render, waitFor } from '@testing-library/react';

import type { ColumnSchema } from '../../../bootstrap/type';
import type { UITableController } from '../../../infrastructure/ui/UITableController';
import { ERPTableHostProvider } from '../../host/ERPTableHost';
import type { UseDependOnHook } from '../../host/dependOn';
import type { UIRow } from '../../type';
import { DescriptionComponent } from '../descriptionComponent';

afterEach(cleanup);

const paging = { PageNumber: 1, PageRecordCount: 10000 };

function setup(opts: { dependOn?: unknown; hook?: UseDependOnHook }) {
  const request = vi.fn(async (_input: { params?: Record<string, unknown> }) => ({
    Data: [],
  }));
  const meta = {
    dynamicSource: { endpoint: '/desc', dependOn: opts.dependOn },
  } as unknown as ColumnSchema;
  render(
    <ERPTableHostProvider
      locale="en"
      remoteApi={{ request } as never}
      useDependOn={opts.hook}
    >
      <DescriptionComponent
        meta={meta}
        controller={{ dispatch: vi.fn() } as unknown as UITableController}
        tableKey="t"
        row={{ id: 'r1' } as unknown as UIRow}
        columnId="desc"
        idx={0}
        inputRef={null}
        isDeleted={false}
        editable
        blockDrag={() => undefined}
        dispatchChangeValue={() => undefined}
        activeCell={() => undefined}
      />
    </ERPTableHostProvider>,
  );
  return request;
}

const hostValue: UseDependOnHook = () => ({
  dependencyBody: { AccountId: 9 },
  isReady: true,
  dependencyKey: 'k',
});

describe('DescriptionComponent dependencies', () => {
  it('sends static values with RepoViewId/RepoId/PagingInfo', async () => {
    const request = setup({ dependOn: [{ fieldName: 'AccountId', value: 5 }] });
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request).toHaveBeenCalledWith({
      endpoint: '/desc',
      params: { AccountId: 5, RepoViewId: 0, RepoId: 0, PagingInfo: paging },
      method: 'POST',
    });
  });

  it('uses the host-resolved value when the static one is missing', async () => {
    const request = setup({
      dependOn: [{ fieldName: 'AccountId' }],
      hook: hostValue,
    });
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request.mock.calls[0][0].params).toMatchObject({ AccountId: 9 });
  });

  it('static value wins over the host value', async () => {
    const request = setup({
      dependOn: [{ fieldName: 'AccountId', value: 5 }],
      hook: hostValue,
    });
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request.mock.calls[0][0].params).toMatchObject({ AccountId: 5 });
  });

  it('does not request while a dependency is unresolved', async () => {
    const request = setup({ dependOn: [{ fieldName: 'AccountId' }] });
    await new Promise((r) => setTimeout(r, 50));
    expect(request).not.toHaveBeenCalled();
  });

  it('requests immediately when there is no dependOn', async () => {
    const request = setup({});
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request.mock.calls[0][0].params).toEqual({
      RepoViewId: 0,
      RepoId: 0,
      PagingInfo: paging,
    });
  });
});
