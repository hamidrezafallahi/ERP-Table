import Form from "@components/templates/form";
import type { IRequest, ITafsiliType } from "@services/acc/tafsiliType/type";

export default function TafsiliTypeFormPage() {
  return (
    <Form<ITafsiliType, IRequest>
      titleKey="TafsiliTypeDesc"
      fieldKey="TafsiliTypeId"
      caption={"title.tafsiliType"}
      url="/api/acc/select/tafsiliType"
      listUrl="acc/tafsiliTypeList"
    />
  );
}
