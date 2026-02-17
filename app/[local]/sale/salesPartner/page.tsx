import Form from "@components/templates/form";
import type {
  IRequest,
  ISalesAssociate,
} from "@services/sale/salesAssociate/type";

export default function SalesPartnerFormPage() {
  return (
    <Form<ISalesAssociate, IRequest>
      fieldKey="SalesPartnerId"
      caption={"title.salesPartner"}
      url="/api/sale/select/salesPartner"
      listUrl="sale/salesPartnerList"
      titleKey={["SalesPartnerDesc","FullName"]}
      pageIcon="SalesAssociateIcon"
    />
  );
}
