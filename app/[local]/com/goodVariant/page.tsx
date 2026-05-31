import { Form } from '@components/templates/form';
import type {
  IRequest,
  IVariant,
} from '@services/com/variant/type';

export default function GoodVariantsFormPage() {
  return (
    <Form<IVariant, IRequest>
      fieldKey="VariantId"
      caption={"title.goodVariant"}
      url="/api/com/select/variant"
      listUrl="com/goodVariantList"
      titleKey="Title"
      pageIcon="VariantIcon"
    />
  );
}
