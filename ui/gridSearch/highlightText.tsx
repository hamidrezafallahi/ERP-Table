import React from 'react';

export function highlightSearchText(
  text: unknown,
  query: string,
  isCurrent: boolean,
): React.ReactNode {
  const display = text == null ? '' : String(text);
  const q = query.trim();
  if (!q) return display;

  const lowerText = display.toLowerCase();
  const lowerQuery = q.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  if (index === -1) return display;

  const markClass = isCurrent ? 'bg-yellow-400 font-semibold' : 'bg-yellow-200';
  const matchLength = lowerQuery.length;

  return (
    <>
      {display.slice(0, index)}
      <mark className={markClass}>{display.slice(index, index + matchLength)}</mark>
      {display.slice(index + matchLength)}
    </>
  );
}
