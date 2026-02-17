import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IRequest, ITafsili } from "@services/acc/tafsili/type";

export default function TafsiliListPage() {
  const t = useTranslations();
  return (
    <ViewList<ITafsili, IRequest>
      url="/api/acc/select/tafsili"
      deleteUrl="/api/acc/delete/tafsili"
      staticKey="TafsiliDesc"
      rowFieldKey="TafsiliId"
      formUrl="acc/tafsili"
      addCaption={t("title.addNew")}
      caption={"title.tafsiliList"}
      baseRepoId={5003}
      EditField="TafsiliDesc"
      pageIcon="TafsiliIcon"
    />
  );
}
