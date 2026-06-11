import ViewList from '@components/templates/viewList';
import type {
  IAssignmentCheck,
  IRequest,
} from '@services/trh/assignmentCheck/type';

export default function assignmentPromissoryNoteListPage() {
  return (
    <ViewList<IAssignmentCheck, IRequest>
      url="api/trh/select/checkAssignment/header"
      deleteUrl="api/trh/delete/checkAssignment/header"
      staticKey="CheckAssignmentHeaderId"
      rowFieldKey="CheckAssignmentHeaderId"
      formUrl="trh/assignmentPromissoryNote"
      caption={"title.assignmentPromissoryNote"}
      baseRepoId={3027}
      pageIcon="BankDepositIcon"
      bodyKey={"PrommisoryType"}
    />
  );
}
