import Form from '@components/templates/form';
import {
  IActParam,
  IRequest,
} from '@services/hr/actParam/type';

export default function ActParamFormPage() {
  return (
    <Form<IActParam, IRequest>
      fieldKey="ActParamId"
      caption={"title.actParam"}
      url="/api/hr/select/actParam"
      listUrl="hr/actParamList"
      titleKey="Title"
      pageIcon="ParameterIcon"
    />
  );
}
