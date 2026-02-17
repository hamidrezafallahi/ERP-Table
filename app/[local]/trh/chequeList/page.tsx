import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { ICheque, IRequest } from "@services/trh/cheque/type";

export default function ChequeListPage() {
  const t = useTranslations();

  return (
    <ViewList<ICheque, IRequest>
      url="/api/trh/select/checkPlacement"
      deleteUrl="/api/trh/delete/checkPlacement"
      staticKey="DisplayName"
      rowFieldKey="CheckPlaceMentId"
      formUrl="trh/cheque"
      addCaption={t("general.addNew")}
      caption={"title.chequeList"}
      baseRepoId={30010}
      pageIcon="File"
    />
  );
}
