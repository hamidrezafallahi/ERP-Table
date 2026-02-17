import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type { ILanguage, IRequest } from "@services/management/language/type";

export default function LanguageList() {
  const t = useTranslations();

  return (
    <ViewList<ILanguage, IRequest>
      url="/api/mng/select/language"
      deleteUrl="/api/mng/delete/language"
      staticKey="LanguageId"
      rowFieldKey="LanguageId"
      formUrl="mng/language"
      addCaption={t("general.addNew")}
      caption={"title.languageList"}
      baseRepoId={207012}
      pageIcon="LanguageIcon"
      EditField="LanguageDesc"
    />
  );
}
