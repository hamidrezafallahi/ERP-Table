import { Form } from '@components/templates/form';
import {
  IDiscount,
  IRequest,
} from '@services/sale/discount/type';

export default function DiscountFormPage() {
  return (
    <Form<IDiscount, IRequest>
      fieldKey="DiscountId"
      caption={"title.discount"}
      url="/api/sale/select/discount"
      listUrl="sale/discountList"
      titleKey="DiscountCode"
      pageIcon="DiscountIcon"
    />
  );
}
