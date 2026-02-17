import { useTranslations } from 'next-intl';

import ViewList from '@components/templates/viewList';
import {
  IRequest,
  IStation,
} from '@services/prd/station/type';

export default function StationListPage() {
  const t = useTranslations();
  return (
    <ViewList<IStation, IRequest>
      url="/api/prd/select/station"
      deleteUrl="/api/prd/delete/station"
      staticKey="StationDesc"
      rowFieldKey="StationId"
      formUrl="prd/station"
      addCaption={t("general.addNew")}
      caption={"title.stationList"}
      baseRepoId={8009}
      EditField="StationId"
    />
  );
}
