import Form from "@components/templates/form";
import type {
  IRequest,
  ISalesCircular,
} from "@services/sale/salesCircular/type";

export default function SalesCircularFormPage() {
  return (
    <Form<ISalesCircular, IRequest>
      fieldKey="SaleRuleId"
      caption={"title.salesCircular"}
      url="/api/sale/select/saleRule"
      listUrl="sale/salesCircularList"
      titleKey="DiscountCode"
      pageIcon="DiscountIcon"
    />
  );
}
