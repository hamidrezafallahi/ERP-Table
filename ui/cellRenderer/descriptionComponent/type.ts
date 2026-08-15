export interface voucherTypeRes {
  Desc: string;
  VoucherTypeDescId: number;
  VoucherTypeDescItemId: number;
}

export interface voucherTypeReq {
  VoucherTypeId: number;
  RepoViewId: number;
  RepoId: number;
  PagingInfo: {
    PageNumber: number;
    PageRecordCount: number;
  };
}

export type VoucherTypeApiResponse = voucherTypeRes[];