import { useMemo } from "react";

export function useFilteredList<T>(
  list: T[],
  search: string,
  keys: (keyof T)[]
) {
  return useMemo(() => {
    const phrase = search.trim().toLowerCase();
    if (!phrase) return list;

    return list.filter((item) => {
      const combined = keys
        .map((key) => String(item[key] ?? "").toLowerCase())
        .join(" ");

      return combined.includes(phrase);
    });
  }, [list, search, keys]);
}