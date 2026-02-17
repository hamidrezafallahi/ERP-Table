import { useTranslations } from "next-intl";

import ViewList from "@components/templates/viewList";
import type {
  IIncreasingAndDecreasingFactors,
  IRequest,
} from "@services/sale/increasingAndDecreasingFactors/type";

export default function IncreasingAndDecreasingFactorsListPage() {
  const t = useTranslations();
  return (
    <ViewList<IIncreasingAndDecreasingFactors, IRequest>
      url="/api/sale/select/AddElement"
      deleteUrl="/api/sale/delete/AddElement"
      staticKey="AddElementId"
      rowFieldKey="AddElementId"
      formUrl="sale/increasingAndDecreasingFactors"
      addCaption={t("general.addNew")}
      caption={"title.increasingAndDecreasingFactors"}
      baseRepoId={1009}
      pageIcon="IncreasingAndDecreasingFactorsIcon"
    />
  );
}
