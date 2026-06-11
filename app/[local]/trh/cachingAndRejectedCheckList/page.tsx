import ViewList from '@components/templates/viewList';
import {
  ICachingAndRejectedCheck,
  IRequest,
} from '@services/trh/cachingAndRejectedCheck/type';

export default function CachingAndRejectedCheckListPage() {
  return (
    <ViewList<ICachingAndRejectedCheck, IRequest>
      url="api/trh/select/checkCashingOrRejected/header"
      deleteUrl=""
      staticKey="headerId"
      rowFieldKey="headerId"
      formUrl="trh/CachingAndRejectedCheck"
      caption={"title.CachingAndRejectedCheck"}
      baseRepoId={3029}
      pageIcon="BankDepositIcon"
    />
  );
}
