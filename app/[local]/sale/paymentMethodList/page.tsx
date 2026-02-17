import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type {
  IPaymentMethod,
  IRequest,
} from "@services/sale/paymentMethod/type";

export default function PaymentMethodList() {
  const t = useTranslations();
  return (
    <ViewList<IPaymentMethod, IRequest>
      url="/api/sale/select/paymentWay"
      deleteUrl="/api/sale/delete/paymentWay"
      staticKey="PaymentWayDesc"
      rowFieldKey="PaymentWayId"
      formUrl="sale/paymentMethod"
      addCaption={t("general.addNew")}
      caption="title.paymentMethodList"
      baseRepoId={1007}
      pageIcon="PaymentMethodIcon"
    />
  );
}
