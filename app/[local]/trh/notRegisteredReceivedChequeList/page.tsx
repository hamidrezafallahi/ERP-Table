import ViewList from "@components/templates/viewList";
import type {
  INotRegisteredCheque,
  IRequest,
} from "@services/trh/notRegisteredCheque/type";

export default function NotRegisteredReceivedChequeListPage() {
  return (
    <ViewList<INotRegisteredCheque, IRequest>
      url="api/trh/select/documentCheque"
      confirmUrl="api/trh/"
      staticKey="DocumentChequeId"
      rowFieldKey="DocumentChequeId"
      caption={"title.notRegisteredReceivedChequeList"}
      baseRepoId={3026}
      pageIcon="NotRegisteredIcon"
    />
  );
}
