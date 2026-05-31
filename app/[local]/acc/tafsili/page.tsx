import { Form } from '@components/templates/form';
import type {
  IRequest,
  ITafsili,
} from '@services/acc/tafsili/type';

export default function TafsiliFormPage() {
  return (
    <Form<ITafsili, IRequest>
      titleKey="TafsiliDesc"
      fieldKey="TafsiliId"
      caption={"title.tafsili"}
      url="/api/acc/select/tafsili"
      listUrl="acc/tafsiliList"
    />
  );
}
