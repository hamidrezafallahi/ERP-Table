import { useTranslations } from 'next-intl';

import ViewList from '@components/templates/viewList';
import {
  ILine,
  IRequest,
} from '@services/prd/line/type';

export default function LineListPage() {
  const t = useTranslations();
  return (
    <ViewList<ILine, IRequest>
      url="/api/prd/select/line"
      deleteUrl="/api/prd/delete/line"
      staticKey="LineId"
      rowFieldKey="LineId"
      formUrl="prd/line"
      addCaption={t("general.addNew")}
      caption={"title.lineList"}
      baseRepoId={8001}
      EditField="LineId"
    />
  );
}
