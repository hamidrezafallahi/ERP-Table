export interface IProps {
  totalValues: {
    totalDetailAmount: number;
    totalDetailAdditionalAmount: number;
    beforeTaxAmount: number;
    detailDecreasing: number;
    detailIncreasing: number;
    vatBaseAmount: number;
  };
  totalOtherValues: {
    otherDecreasing: number;
    otherIncreasing: number;
    taxes: number;
    discounts: number;
  };
}
