import { useTranslations } from 'next-intl';

import ViewList from '@components/templates/viewList';
import {
  IActParam,
  IRequest,
} from '@services/hr/actParam/type';

export default function ActParamList() {
  const t = useTranslations();

  return (
    <ViewList<IActParam, IRequest>
      url="/api/hr/select/actParam"
      deleteUrl="/api/hr/delete/actParam"
      staticKey="ActParamId"
      rowFieldKey="ActParamId"
      formUrl="hr/actParam"
      addCaption={t("general.addNew")}
      caption={"title.actParamList"}
      baseRepoId={9017}
      pageIcon="ParameterIcon"
      EditField="ActParamTitle"
      additionalFieldKey="ActBaseParamId"
    />
  );
}
