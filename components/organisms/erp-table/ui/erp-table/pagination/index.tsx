// ui/pagination.tsx

import { CustomButton } from '@components/atoms/defaultElements';
import {
  UITableController,
} from '@components/organisms/erp-table/adapters/ui/UITableController';

interface Props {
  controller: UITableController;
  tableId: string;
}

export default function ERPTablePagination({ controller, tableId }: Props) {
  const { pagination } = controller.getViewState(tableId);
  const { page, pageSize, canPrev, canNext } = pagination;
const onPageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const nextSize = Number(e.target.value);

  if (nextSize !== pageSize) {
    controller.dispatch({type:'CHANGE_PAGE_SIZE',pageSize:nextSize});
  }
};
  return (
    <div className="flex items-center gap-3">
      <CustomButton
        disabled={!canPrev}
        onClick={() =>controller.dispatch({type:'CHANGE_PAGE',page:page - 1})}
      >
        {'<'}
      </CustomButton>

      <span className="text-sm">{page}</span>

      <CustomButton
        disabled={!canNext}
        onClick={() =>controller.dispatch({type:'CHANGE_PAGE',page:page + 1})}

      >
        {'>'}
      </CustomButton>

      <select
        value={pageSize}
         onChange={onPageSizeChange}
        className="px-2 py-1 border rounded"
      >
        {[5,10, 20, 30, 40, 50].map(ps => (
          <option key={ps} value={ps}>
            {ps}
          </option>
        ))}
      </select>
    </div>
  );
}
