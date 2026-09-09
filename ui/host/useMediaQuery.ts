"use client";

import { useEffect, useState } from 'react';

const QUERIES: Record<string, string> = {
  XLUP: '(min-width: 1024px)',
  XXLUP: '(min-width: 1366px)',
};

export function useMediaQuery(query: string): { match: boolean | null } {
  const media = QUERIES[query] ?? query;
  const [match, setMatch] = useState<boolean | null>(() => {
    if (typeof window === 'undefined') return null;
    return window.matchMedia(media).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(media);
    const onChange = () => setMatch(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [media]);

  return { match };
}
