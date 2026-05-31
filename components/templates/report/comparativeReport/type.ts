export interface TableData {
    columns
    Data
    TotalCount
}

export type HookResponse = readonly [
  (
    params: { url: string; body: any }
  ) => Promise<any>,
  {
    data: TableData;
    isLoading: boolean;
    PageNumber: number;
    PageRecordCount: number;
  }
];
