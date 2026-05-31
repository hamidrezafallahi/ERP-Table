import { Form } from '@components/templates/form';
import {
  ILine,
  IRequest,
} from '@services/prd/line/type';

export default function LineFormPage( ) {
  return (
    <Form<ILine, IRequest>
      caption={"title.line"}
      fieldKey="LineId"
      url="/api/prd/select/line"
      listUrl="prd/lineList"
      titleKey="LineDesc"
      
    />
  );
}
