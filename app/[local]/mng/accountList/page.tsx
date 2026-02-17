import ViewList from "@components/templates/viewList";
import type { IAccountList, IRequest } from "@services/mng/accountList/type";

export default function AccountList() {
  return (
    <ViewList<IAccountList, IRequest>
      url="/api/mng/select/accounts"
      rowFieldKey="AccountId"
      caption={"title.accountList"}
      pageIcon="AccountListIcon"
      baseRepoId={207001}
      staticKey="UserDesc"
      withoutActivation
    />
  );
}
