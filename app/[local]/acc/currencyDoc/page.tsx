import { ActionLabelsEnum } from "@components/organisms/list/enum";
import Form from "@components/templates/form";
import type { IRequest, ICurrencyDoc } from "@services/acc/currencyDoc/type";

export default function CurrencyDocFormPage() {
  return (
    <Form<ICurrencyDoc, IRequest>
      titleKey="CurrencyDesc"
      fieldKey="CostConversionId"
      caption={"title.currencyDoc"}
      url="/api/acc/select/CostConversion"
      listUrl="acc/currencyDockList"
      conditionalActions={[
        {
          conditionallyAction: ActionLabelsEnum.CurrencyConversion,
          conditionalProperty: "HasVoucher",
          opposite: true,
        },
        {
          conditionallyAction: ActionLabelsEnum.DeleteAccountingDocument,
          conditionalProperty: "HasVoucher",
          opposite: false,
        },
        {
          conditionallyAction: ActionLabelsEnum.RelatedAccountingDocument,
          conditionalProperty: "HasVoucher",
          opposite: false,
        },
      ]}
    />
  );
}
