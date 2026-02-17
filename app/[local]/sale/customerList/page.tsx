import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { ICustomer, IRequest } from "@services/sale/customer/type";

export default function CustomerList() {
  const t = useTranslations();
  return (
    <ViewList<ICustomer, IRequest>
      url="/api/sale/select/customer"
      deleteUrl="/api/sale/delete/customer"
      staticKey="CustomerId"
      rowFieldKey="CustomerId"
      formUrl="sale/customer"
      addCaption={t("general.addNew")}
      caption={"title.customerList"}
      baseRepoId={1012}
      pageIcon="SaleListIcon"
      EditField="CustomerCode"
    />
  );
}
