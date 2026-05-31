import { Form } from '@components/templates/form';
import type {
  IPattern,
  IRequest,
} from '@services/mng/pattern/type';

export default function PatternsFormPage() {
  return (
    <Form<IPattern, IRequest>
      caption={"title.patterns"}
      fieldKey="PatternId"
      url="/api/mng/select/patterns"
      listUrl={null}
      titleKey="PatternDesc"
    />
  );
}
