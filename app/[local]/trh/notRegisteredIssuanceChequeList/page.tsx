import ViewList from "@components/templates/viewList";
import type {
  INotRegisteredCheque,
  IRequest,
} from "@services/trh/notRegisteredCheque/type";

export default function NotRegisteredIssuanceChequeListPage() {
  return (
    <ViewList<INotRegisteredCheque, IRequest>
      url="api/trh/select/checkPlacementDetail4Register"
      confirmUrl="api/trh/update/checkPlaceMentDetail/submitSayyadSystem"
      staticKey="CheckPlaceMentDetailId"
      rowFieldKey="CheckPlaceMentDetailId"
      caption={"title.notRegisteredIssuanceChequeList"}
      baseRepoId={3022}
      pageIcon="NotRegisteredIcon"
    />
  );
}
