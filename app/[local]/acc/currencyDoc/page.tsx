import Form from "@components/templates/form";
import type { IRequest, ICurrencyDoc } from "@services/acc/currencyDoc/type";

export default function CurrencyDocFormPage() {
    return (
        <Form<ICurrencyDoc, IRequest>
            titleKey="ToDate"
            fieldKey="CostConversionId"
            caption={"title.currencyDoc"}
            url="/api/acc/select/CostConversion"
            listUrl="acc/currencyDockList"
        />
    );
}
