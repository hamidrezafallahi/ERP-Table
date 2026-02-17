import Form from "@components/templates/form";
import type { IRequest, IStock } from "@services/inv/stock/type";

export default function StockFormPage() {
  return (
    <Form<IStock, IRequest>
      fieldKey="StockId"
      caption={"title.stock"}
      url="/api/inv/select/stock"
      listUrl="inv/stockList"
      titleKey="StockDesc"
      pageIcon="StockIcon"
    />
  );
}
