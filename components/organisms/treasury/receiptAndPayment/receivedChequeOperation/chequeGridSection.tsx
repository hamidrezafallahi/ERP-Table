import { ActionGrid } from "@components/molecules/receiptAndPayment/cheque";
import ActionCard from "@components/molecules/receiptAndPayment/cheque/actionCard";
import React from "react";

const ChequeGridSection = (props: any) => {
  const { match } = props;
  if (!match) {
    return <ActionCard {...props} />;
  }
  return <ActionGrid {...props} />;
};

export default ChequeGridSection;
