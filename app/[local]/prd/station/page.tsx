import { Form } from '@components/templates/form';
import {
  IRequest,
  IStation,
} from '@services/prd/station/type';

export default function StationFormPage( ) {
  return (
    <Form<IStation, IRequest>
      caption={"title.station"}
      fieldKey="StationId"
      url="/api/prd/select/station"
      listUrl="prd/stationList"
      titleKey="StationDesc"
      // isModal={isModal}
      // parentPageId={parentPageId}
    />
  );
}
