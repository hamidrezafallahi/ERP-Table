import Form from "@components/templates/form";
import type { ICostCenter, IRequest } from "@services/com/costCenter/type";

export default function CostCenterFormPage() {
  return (
    <Form<ICostCenter, IRequest>
      caption={"title.costCenter"}
      fieldKey="CostCenterId"
      url="/api/com/select/costCenter"
      listUrl="com/costCenterList"
      titleKey={["CostCenterDesc", "CostCenterCode"]}
      pageIcon="DollarSignIcon"
      
    />
  );
}
