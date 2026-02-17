import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IRequest, ISaleType } from "@services/sale/saleType/type";

export default function SaleTypeList() {
  const t = useTranslations();
  return (
    <ViewList<ISaleType, IRequest>
      url="api/sale/select/type"
      deleteUrl="api/sale/delete/type"
      rowFieldKey="SalTypeId"
      formUrl="sale/saleType"
      addCaption={t("general.addNew")}
      caption={"title.saleTypeList"}
      baseRepoId={1006}
      pageIcon="SaleType"
      EditField="SalTypeCode"
    />
  );
}
