/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { act, cleanup, fireEvent, render, waitFor } from '@testing-library/react';

import { ERPTableHostProvider } from '../../host/ERPTableHost';
import { ERPTableDynamicSelect } from '../ERPTableDynamicSelect';

afterEach(cleanup);

const payload = {
  Data: [
    { _SelectId: 1, _SelectValue: 'v1', _SelectDisplay: 'Alpha' },
    { _SelectId: 2, _SelectValue: 'v2', _SelectDisplay: 'Beta' },
    { _SelectId: 3, _SelectValue: 'v3', _SelectDisplay: 'Gamma' },
  ],
  ReturnCount: 3,
};

function setup(props: React.ComponentProps<typeof ERPTableDynamicSelect>) {
  const request = vi.fn(async () => payload);
  const ui = (p: typeof props) => (
    <ERPTableHostProvider remoteApi={{ request } as never} locale="en">
      <ERPTableDynamicSelect {...p} />
    </ERPTableHostProvider>
  );
  const view = render(ui(props));
  return { request, view, rerender: (p: typeof props) => view.rerender(ui(p)) };
}

async function open(container: HTMLElement) {
  const root = await waitFor(() => {
    const el = container.querySelector('.ant-select');
    if (!el) throw new Error('not loaded');
    return el as HTMLElement;
  }, { timeout: 5000 });
  fireEvent.mouseDown(root);
  return root;
}

const optionTexts = () =>
  [...document.querySelectorAll('.ant-select-item-option')].map((n) => n.textContent);

describe('ERPTableDynamicSelect (host parity)', () => {
  it('fetches once on mount with the dynamic source body and lists display labels', async () => {
    const { request, view } = setup({ dynamicValue: { endpoint: '/api/list', repoViewId: 'R1' } });
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request).toHaveBeenCalledWith({
      endpoint: '/api/list',
      params: { RepoViewId: 'R1' },
      method: 'POST',
    });
    await open(view.container);
    await waitFor(() => expect(optionTexts()).toEqual(['Alpha', 'Beta', 'Gamma']));
  });

  it('labelValue="selectValue" labels with _SelectValue but the list still shows the title', async () => {
    const { view } = setup({ dynamicValue: { endpoint: '/x' }, labelValue: 'selectValue', value: 2 });
    await waitFor(() =>
      expect(view.container.querySelector('.ant-select-selection-item')?.textContent).toBe('v2'),
    );
    await open(view.container);
    await waitFor(() => expect(optionTexts()).toEqual(['Alpha', 'Beta', 'Gamma']));
  });

  it('does not fetch while dependOn is unresolved', async () => {
    const { request } = setup({
      dynamicValue: { endpoint: '/x', dependOn: [{ fieldName: 'YearId', value: undefined }] },
    });
    await new Promise((r) => setTimeout(r, 50));
    expect(request).not.toHaveBeenCalled();
  });

  it('sends dependOn values in the body and refetches (debounced) when they change', async () => {
    const { request, rerender } = setup({
      dynamicValue: { endpoint: '/x', dependOn: [{ fieldName: 'YearId', value: 1 }] },
    });
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request.mock.calls[0][0].params).toMatchObject({ YearId: 1 });
    rerender({ dynamicValue: { endpoint: '/x', dependOn: [{ fieldName: 'YearId', value: 2 }] } });
    await new Promise((r) => setTimeout(r, 300));
    expect(request).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2), { timeout: 2000 });
    expect(request.mock.calls[1][0].params).toMatchObject({ YearId: 2 });
  });

  it('filterOptions removes options from the list (isUnique use case)', async () => {
    const { view } = setup({
      dynamicValue: { endpoint: '/x' },
      filterOptions: (o) => o.value !== 2,
    });
    await open(view.container);
    await waitFor(() => expect(optionTexts()).toEqual(['Alpha', 'Gamma']));
  });

  it('valueLabel stands in for a value that is not in the loaded options', async () => {
    const { request, view } = setup({
      dynamicValue: { endpoint: '/x' },
      value: 77,
      valueLabel: 'Stored label',
    });
    await waitFor(() => expect(request).toHaveBeenCalled());
    await waitFor(() =>
      expect(view.container.querySelector('.ant-select-selection-item')?.textContent).toBe('Stored label'),
    );
  });

  it('search uses label contains by default and a custom filterOption when given', async () => {
    const { view } = setup({ dynamicValue: { endpoint: '/x' } });
    await open(view.container);
    await waitFor(() => expect(optionTexts()).toHaveLength(3));
    const input = view.container.querySelector('input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'ALP' } });
    await waitFor(() => expect(optionTexts()).toEqual(['Alpha']));
    cleanup();

    const custom = setup({
      dynamicValue: { endpoint: '/x' },
      filterOption: (input, option) => option.value === Number(input),
    });
    await open(custom.view.container);
    await waitFor(() => expect(optionTexts()).toHaveLength(3));
    fireEvent.change(custom.view.container.querySelector('input') as HTMLInputElement, {
      target: { value: '3' },
    });
    await waitFor(() => expect(optionTexts()).toEqual(['Gamma']));
  });

  it('shows the reload icon unless showRefetch === false, and clicking it refetches', async () => {
    const shown = setup({ dynamicValue: { endpoint: '/x' } });
    await waitFor(() => expect(shown.request).toHaveBeenCalledTimes(1));
    const icon = shown.view.container.querySelector('.relative > div[style*="absolute"]') as HTMLElement;
    expect(icon).not.toBeNull();
    await act(async () => {
      fireEvent.click(icon);
    });
    await waitFor(() => expect(shown.request).toHaveBeenCalledTimes(2));
    cleanup();
    const hidden = setup({ dynamicValue: { endpoint: '/x' }, showRefetch: false });
    await waitFor(() => expect(hidden.request).toHaveBeenCalled());
    expect(hidden.view.container.querySelector('.relative > div[style*="absolute"]')).toBeNull();
  });
});
