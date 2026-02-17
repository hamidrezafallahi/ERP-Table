import Form from "@components/templates/form";
import type { IRequest, ISaleType } from "@services/sale/saleType/type";

export default function SaleTypeFormPage() {
  return (
    <Form<ISaleType, IRequest>
      caption={"title.saleType"}
      fieldKey="SalTypeId"
      url="/api/sale/select/type"
      listUrl="sale/saleTypeList"
      titleKey="SalTypeDesc"
      pageIcon="SaleType"
    />
  );
}
