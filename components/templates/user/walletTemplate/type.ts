export type TxStatus = boolean;

export type IWalletResponse = {
  WalletId: number;
  Desc: string;
  PayCode: number;
  Price: number;
  CreateDate: string;
  Status: TxStatus;
  // TotalCount: number;
};
export interface IRequest {
  config: string;
}
