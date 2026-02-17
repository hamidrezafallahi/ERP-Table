import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type {
  IChequeReceipt,
  IRequest,
} from "@services/trh/chequeReceipt/type";

export default function ChequeReceiptListPage() {
  const t = useTranslations();
  return (
    <ViewList<IChequeReceipt, IRequest>
      url="api/trh/select/check/receipt"
      deleteUrl="api/trh/delete/check/receipt"
      staticKey="VoucherNumber"
      staticKeyII="VoucherDate"
      rowFieldKey="CheckReceiptHeaderId"
      formUrl="trh/chequeReceipt"
      addCaption={t("general.addNew")}
      caption={"title.chequeReceiptList"}
      baseRepoId={3025}
      pageIcon="ChequeReceiptIcon"
    />
  );
}
