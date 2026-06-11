import AssignmentChequeOrganism
  from '@components/organisms/receiptAndPayment/cheque&promissoryNote/assignmentCheque/AssignmentChequeOrganism';
import { MasterForm } from '@components/templates/form';
import type {
  IAssignmentCheck,
  IRequest,
} from '@services/trh/assignmentCheck/type';

export default function assignmentPromissoryNotePage() {
  return (
    <MasterForm<IAssignmentCheck, IRequest>
      caption={"title.assignmentPromissoryNote"}
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
      storeName="receiptAndPayment"
      DefaultDetailRepoViewId={100}//=========================================
      DefaultHeaderRepoViewId={100}//=========================================
      Component={AssignmentChequeOrganism}
       type={"Promissory"}
    />
  );
}
