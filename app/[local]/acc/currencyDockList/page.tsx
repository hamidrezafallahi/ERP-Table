import { ActionLabelsEnum } from "@components/organisms/list/enum";
import ViewList from "@components/templates/viewList";
import type { IRequest, ICurrencyDoc } from "@services/acc/currencyDoc/type";
import { useTranslations } from "next-intl";
export default function CurrencyDockListPage() {
  const t = useTranslations();
  return (
    <ViewList<ICurrencyDoc, IRequest>
      url="/api/acc/select/CostConversion"
      deleteUrl="/api/acc/delete/CostConversion"
      staticKey="CurrencyDesc"
      rowFieldKey="CostConversionId"
      formUrl="acc/currencyDoc"
      addCaption={t("title.addNew")}
      caption={t("title.currencyDockList")}
      baseRepoId={5021}
      EditField="ToDate"
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
