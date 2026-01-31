export interface ICardProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showCheckbox?: boolean;
  item: {
    id: number;
    title: string;
    description?: string;
    price?: number;
    AccountingSoftware?: boolean;
    SalesSoftware?: boolean;
    TaxpayerSystem?: boolean;
    TreasurySoftware?: boolean;
    WarehousingSoftware?: boolean;
    PayrollSoftware?: boolean;
    PropertyAndAssetSoftware?: boolean;
    ProductionSoftware?: boolean;
    ActiveCard: boolean;
  };
}
