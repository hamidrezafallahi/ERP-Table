import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IRequest, ITafsiliType } from "@services/acc/tafsiliType/type";

export default function TafsiliTypeListPage() {
  const t = useTranslations();
  return (
    <ViewList<ITafsiliType, IRequest>
      url="/api/acc/select/tafsiliType"
      deleteUrl="/api/acc/delete/tafsiliType"
      staticKey="TafsiliTypeDesc"
      rowFieldKey="TafsiliTypeId"
      formUrl="acc/tafsiliType"
      addCaption={t("title.addNew")}
      caption={"title.tafsiliType"}
      baseRepoId={5004}
      EditField="TafsiliTypeDesc"
    />
  );
}
