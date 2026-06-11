import AssignmentChequeOrganism
  from '@components/organisms/receiptAndPayment/cheque&promissoryNote/assignmentCheque/AssignmentChequeOrganism';
import { MasterForm } from '@components/templates/form';
import type {
  IAssignmentCheck,
  IRequest,
} from '@services/trh/assignmentCheck/type';

export default function AssignmentChequeFormPage() {
  return (
    <MasterForm<IAssignmentCheck, IRequest>
      caption={"title.assignmentCheque"}
      captionII=""
      addUrl="api/trh/insert/assignmentCheque"
      updateUrl="api/trh/update/assignmentCheque"
      listUrl="trh/assignmentChequeList"
      pageIcon="ChequeReceiptIcon"
      tableTitle="لیست چک ها"
      detailFieldKey="CheckAssignmentDetailId"
      headerFieldKey="CheckAssignmentHeaderId"
      headerGetUrl="api/trh/select/checkAssignment/header"
      detailGetUrl="api/trh/select/checkAssignment/detail"
      Component={AssignmentChequeOrganism}
      DefaultHeaderRepoViewId={140018}
      DefaultDetailRepoViewId={140017}
      storeName="receiptAndPayment"
      type={"Cheque"}
    />
  );
}
