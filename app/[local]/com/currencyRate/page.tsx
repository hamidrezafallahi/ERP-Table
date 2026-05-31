import { Form } from '@components/templates/form';
import type {
  ICurrencyRate,
  IRequest,
} from '@services/com/currencyRate/type';

export default function CurrencyRateFormPage() {
  return (
    <Form<ICurrencyRate, IRequest>
      caption={"title.currencyRate"}
      fieldKey="CurrencyRateId"
      url="/api/com/select/currencyRate"
      listUrl="com/currencyRateList"
      titleKey={["MainCurrencyDesc","CurrencyDesc"]}
      pageIcon="CurrencyRateIcon"
    />
  );
}
