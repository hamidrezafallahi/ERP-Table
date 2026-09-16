export type Line = {
  id: string;
  item: string;
  qty: number;
  price: number;
  category: string;
  date: string;
  note?: string;
};

export const SAMPLE_LINES: Line[] = [
  { id: '1', item: 'Cable', qty: 12, price: 120_000, category: 'Parts', date: '1404-01-15', note: 'A' },
  { id: '2', item: 'Switch', qty: 4, price: 85_000, category: 'Parts', date: '1404-01-18', note: 'B' },
  { id: '3', item: 'Service', qty: 1, price: 500_000, category: 'Labor', date: '1404-02-01', note: 'C' },
  { id: '4', item: 'Bracket', qty: 20, price: 15_000, category: 'Parts', date: '1404-02-05', note: 'D' },
  { id: '5', item: 'Install', qty: 2, price: 250_000, category: 'Labor', date: '1404-02-10', note: 'E' },
];

export function makeLines(n: number): Line[] {
  const cats = ['Parts', 'Labor', 'Freight'];
  return Array.from({ length: n }, (_, i) => ({
    id: String(i + 1),
    item: `Item ${i + 1}`,
    qty: (i % 20) + 1,
    price: ((i * 137) % 900) * 1000,
    category: cats[i % cats.length]!,
    date: '1404-01-01',
  }));
}
