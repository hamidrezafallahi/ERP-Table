import { Form } from '@components/templates/form';
import {
  IDiscountType,
  IRequest,
} from '@services/sale/discountType/type';

export default function DiscountTypeFormPage() {
  return (
    <Form<IDiscountType, IRequest>
      fieldKey="CommonId"
      caption={"title.discountType"}
      url="/api/com/select/discountTypeCommonInfo"
      listUrl="com/discountTypeList"
      titleKey="CommonDesc"
      pageIcon="DiscountTypeIcon"
    />
  );
}
