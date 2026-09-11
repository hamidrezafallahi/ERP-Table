import React from 'react';

import { toFaDigits } from '../helper';

function findHighlightRange(
  display: string,
  query: string,
): { index: number; length: number } | null {
  const lowerText = display.toLowerCase();
  const seen = new Set<string>();
  for (const candidate of [query, toFaDigits(query)]) {
    const needle = candidate.toLowerCase();
    if (!needle || seen.has(needle)) continue;
    seen.add(needle);
    const index = lowerText.indexOf(needle);
    if (index !== -1) return { index, length: candidate.length };
  }
  return null;
}

/** Read-only cell text: wrap the current grid-search hit, otherwise return the string. */
export function highlightIfCurrentSearch(
  text: unknown,
  query: string | undefined,
  isCurrent: boolean | undefined,
): React.ReactNode {
  const display = text == null ? '' : String(text);
  if (isCurrent && query?.trim()) {
    return highlightSearchText(display, query, true);
  }
  return display;
}

export function highlightSearchText(
  text: unknown,
  query: string,
  isCurrent: boolean,
): React.ReactNode {
  const display = text == null ? '' : String(text);
  const q = query.trim();
  if (!q) return display;

  const range = findHighlightRange(display, q);
  if (!range) return display;

  const markClass = isCurrent ? 'erp-search-hit is-current' : 'erp-search-hit';

  return (
    <>
      {display.slice(0, range.index)}
      <mark className={markClass}>
        {display.slice(range.index, range.index + range.length)}
      </mark>
      {display.slice(range.index + range.length)}
    </>
  );
}
