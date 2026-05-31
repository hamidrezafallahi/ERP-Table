import { ActionLabelsEnum } from '@components/organisms/list/enum';
import { Form } from '@components/templates/form';
import type {
  IGood,
  IRequest,
} from '@services/com/good/type';

export default function GoodsFormPage() {
  return (
    <Form<IGood, IRequest>
      fieldKey="GoodsId"
      caption={"title.good"}
      
      url="/api/com/select/goods"
      listUrl="com/goodList"
      titleKey={["GoodsDesc" ,"GoodsCode"]}
      pageIcon="GoodsIcon"
      conditionalActions={[
        {
          conditionalProperty: "HasVariant",
          conditionallyAction: ActionLabelsEnum.GoodVariantValues as string,
        },
        {
          conditionalProperty: "HasInputQuality",
          conditionallyAction: ActionLabelsEnum.GoodQc as string,
        },
      ]}
      withImage
    />
  );
}
