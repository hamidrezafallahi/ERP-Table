import { Form } from '@components/templates/form';
import {
  IRequest,
  IStockLocation,
} from '@services/inv/stockLocation/type';

export default function StockLocationFormPage() {
  return (
    <Form<IStockLocation, IRequest>
      fieldKey="StockId"
      caption={"title.stock"}
      url="/api/inv/select/stock"
      listUrl="inv/stockList"
      titleKey="StockDesc"
      pageIcon="StockIcon"
    />
  );
}
