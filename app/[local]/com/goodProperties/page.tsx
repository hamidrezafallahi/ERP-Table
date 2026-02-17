import Form from "@components/templates/form";
import type { IGoodProperty, IRequest } from "@services/com/goodProperty/type";

export default function GoodPropertiesFormPage() {
  return (
    <Form<IGoodProperty, IRequest>
      fieldKey="goodsExtraInfoId"
      caption={"title.goodProperties"}
      url="/api/com/select/goodsExtraInfo"
      listUrl="com/goodPropertiesList"
      titleKey="GoodsExtraInfoDesc"
      pageIcon="GoodsExtraInfoIdIcon"
    />
  );
}
