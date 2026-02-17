import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { IPerson, IRequest } from "@services/com/person/type";

export default function PersonListPage() {
  const t = useTranslations();

  return (
    <ViewList<IPerson, IRequest>
      url="/api/com/select/person"
      deleteUrl="/api/com/delete/person"
      staticKey="FullName"
      rowFieldKey="PersonId"
      formUrl="com/person"
      addCaption={t("general.addNew")}
      caption={"title.personList"}
      baseRepoId={106045}
      pageIcon="PersonPageIcon"
      EditField="FullName"
    />
  );
}
