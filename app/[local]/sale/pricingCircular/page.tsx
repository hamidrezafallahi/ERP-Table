import { PricingCircular } from '@components/organisms/salesAndPurchase';
import Form from '@components/templates/form';
import type {
  IPricingCircular,
  IRequest,
} from '@services/sale/pricingCircular/type';

export default function PricingCircularFormPage() {
  return (
    <Form<IPricingCircular, IRequest>
      fieldKey="DiscountId"
      caption={"title.pricingCircular"}
      url="/api/sale/select/priceOrder"
      listUrl="sale/pricingCircularList"
      titleKey="PriceOrderDesc"
      pageIcon="DiscountIcon"
      Component={PricingCircular}
    />
  );
}
