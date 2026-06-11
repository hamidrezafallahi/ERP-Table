import ViewList from '@components/templates/viewList';
import {
  IRefundCheque,
  IRequest,
} from '@services/trh/refundCheque/type';

export default function RefundChequeListPage() {
  return (
    <ViewList<IRefundCheque, IRequest>
      url="api/trh/select/checkReversal/header"
      deleteUrl=""
      staticKey="checkReversalHeaderId"
      rowFieldKey="checkReversalHeaderId"
      formUrl="trh/refundCheque"
      caption={"title.refundChequeList"}
      baseRepoId={3031}
      pageIcon="BankDepositIcon"
    />
  );
}
