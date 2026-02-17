import Form from "@components/templates/form";
import { IRequest, ITax } from "@services/com/tax/type";

export default function TaxFormPage() {
  return (
    <Form<ITax, IRequest>
      fieldKey="TaxId"
      caption={"title.tax"}
      url="/api/com/select/tax"
      listUrl="com/taxList"
      titleKey="TaxDesc"
      pageIcon="TaxIcon"
    />
  );
}
