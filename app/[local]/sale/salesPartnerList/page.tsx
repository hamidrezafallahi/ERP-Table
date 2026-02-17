import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type {
  IRequest,
  ISalesAssociate,
} from "@services/sale/salesAssociate/type";

export default function SalesPartnerList() {
  const t = useTranslations();
  return (
    <ViewList<ISalesAssociate, IRequest>
      url="/api/sale/select/salesPartner"
      deleteUrl="/api/sale/delete/salesPartner"
      staticKey="SalesPartnerId"
      rowFieldKey="SalesPartnerId"
      formUrl="sale/salesPartner"
      addCaption={t("general.addNew")}
      caption={"title.salesPartnerList"}
      baseRepoId={1017}
      pageIcon="SalesAssociateIcon"
      EditField="SalesPartnerDesc"
    />
  );
}
