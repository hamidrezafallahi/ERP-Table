export interface IItems<TPageId extends string | number = number> {
  itemsByPage: Record<TPageId, number[]>;
}
