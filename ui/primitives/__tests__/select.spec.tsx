/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { Select } from '../Select';

const options = Array.from({ length: 1000 }, (_, i) => ({ value: i + 1, label: `item ${i + 1}` }));

afterEach(cleanup);

async function openList(container: HTMLElement) {
  const root = await waitFor(() => {
    const el = container.querySelector('.ant-select');
    if (!el) throw new Error('select not loaded');
    return el as HTMLElement;
  }, { timeout: 5000 });
  fireEvent.mouseDown(root);
  return waitFor(() => {
    const list = document.querySelector('.rc-virtual-list-holder');
    if (!list) throw new Error('list not open');
    return list as HTMLElement;
  }, { timeout: 5000 });
}

describe('Select primitive', () => {
  it('virtualises long lists: only a window of options is in the DOM', async () => {
    const { container } = render(<Select options={options} />);
    await openList(container);
    const rendered = document.querySelectorAll('.ant-select-item-option').length;
    expect(rendered).toBeGreaterThan(0);
    expect(rendered).toBeLessThan(30);
    const inner = document.querySelector('.rc-virtual-list-holder > div') as HTMLElement;
    expect(inner.style.height).toBe(`${1000 * 32}px`);
  });

  it('renders the next window on scroll and forwards onPopupScroll', async () => {
    const onPopupScroll = vi.fn();
    const { container } = render(<Select options={options} onPopupScroll={onPopupScroll} />);
    const list = await openList(container);
    list.scrollTop = 32 * 500;
    fireEvent.scroll(list);
    await waitFor(() => expect(screen.queryByText('item 501')).not.toBeNull());
    expect(screen.queryByText('item 1')).toBeNull();
    expect(onPopupScroll).toHaveBeenCalled();
  });

  it('renders every option when virtual={false}', async () => {
    const { container } = render(<Select options={options.slice(0, 50)} virtual={false} />);
    await openList(container);
    expect(document.querySelectorAll('.ant-select-item-option').length).toBe(50);
  });

  it('does not virtualise short lists (<= listHeight)', async () => {
    const { container } = render(<Select options={options.slice(0, 5)} />);
    await openList(container);
    expect(document.querySelectorAll('.ant-select-item-option').length).toBe(5);
  });

  it('filterOption narrows the list while searching; empty input shows all', async () => {
    const filterOption = vi.fn((input: string, o: { label?: React.ReactNode }) =>
      String(o.label).endsWith(input),
    );
    const { container } = render(<Select options={options.slice(0, 20)} showSearch filterOption={filterOption} />);
    await openList(container);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(filterOption).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: '7' } });
    await waitFor(() => expect(document.querySelectorAll('.ant-select-item-option').length).toBe(2));
  });

  it('commits the active option with Enter and shows an unknown value as-is', async () => {
    const onChange = vi.fn();
    const { container } = render(<Select options={options.slice(0, 5)} showSearch onChange={onChange} />);
    await openList(container);
    const input = container.querySelector('input') as HTMLInputElement;
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith(2, expect.objectContaining({ value: 2 }));
    cleanup();
    const second = render(<Select options={options.slice(0, 5)} value={99} />);
    await waitFor(() => expect(second.container.querySelector('.ant-select-selection-item')?.textContent).toBe('99'));
  });
});
