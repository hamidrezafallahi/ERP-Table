import { useTranslations } from 'next-intl';

import ViewList from '@components/templates/viewList';
import {
  IMachin,
  IRequest,
} from '@services/prd/machin/type';

export default function MachinListPage() {
  const t = useTranslations();
  return (
    <ViewList<IMachin, IRequest>
      url="/api/prd/select/machin"
      deleteUrl="/api/prd/delete/machin"
      staticKey="MachinDesc"
      rowFieldKey="MachinId"
      formUrl="prd/machin"
      addCaption={t("general.addNew")}
      caption={"title.machinList"}
      baseRepoId={8002}
      EditField="MachinId"
      pageIcon="MachinIcon"
    />
  );
}
