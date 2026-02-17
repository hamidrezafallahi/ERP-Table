import ViewList from "@components/templates/viewList";
import type {
  IRequest,
  IRequiringInspectionItems,
} from "@services/inv/requiringInspectionItems/type";

export default function RequiringInspectionItemsList() {
  return (
    <ViewList<IRequiringInspectionItems, IRequest>
      url="/api/inv/select/inspection"
      deleteUrl=""
      staticKey="UniqueId"
      rowFieldKey="UniqueId"
      formUrl={null}
      addCaption={null}
      caption={"title.requiringInspectionItems"}
      baseRepoId={2009}
      pageIcon="RequiringInspectionIcon"
      withoutActivation
    />
  );
}
