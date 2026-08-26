// ui/pagination.tsx

import { Pagination } from 'antd';
import { useLocale } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  LeftChevron,
  RightChevron,
} from '@components/atoms/iconComponents';

import { UITableController } from '../../infrastructure/ui/UITableController';

interface Props {
  controller: UITableController;
  tableKey: string;
  store: string;
}

export default function ERPTablePagination({
  controller,
  tableKey
}: Props) {
  const table = controller.getViewState();
  const locale = useLocale();
  const direction = locale === "fa" ? "rtl" : "ltr";
  if (!table) return null;
  const { page, pageSize, totalPages, totalRows } = table.pagination;
  const handlePageChange = (e: number) => {
    controller.dispatch({ type: "CHANGE_PAGE", page: e });
  };
  const handlePageSizeChange = (_page: number, pageSize: number) => {
    controller.dispatch({ type: "CHANGE_PAGE_SIZE", pageSize: pageSize });
  };

  return (
    <div className="flex items-center gap-3">
      <Pagination
        prevIcon={
          <CustomButton className="m-0 p-0 rounded w-fit">
            {direction === "rtl" ? <RightChevron /> : <LeftChevron />}
          </CustomButton>
        }
        nextIcon={
          <CustomButton className="m-0 p-0 w-fit">
            {direction === "rtl" ? <LeftChevron /> : <RightChevron />}
          </CustomButton>
        }
        className={`
  [&_.ant-pagination-item-active:hover]:!bg-main-black 
  [&_.ant-pagination-item-active:hover]:!border-main-black 
  [&_.ant-pagination-item-active]:!border-main-black 
  [&_.ant-pagination-next_.ant-btn:hover]:!border-main-black 
  [&_.ant-pagination-prev_.ant-btn:hover]:!border-main-black 
  [&_.ant-pagination-item-active_a:hover]:!text-main-white 
  [&_.ant-pagination-item-active_a]:!text-main-black
`}
        current={page}
        jumpNextIcon={<span>...</span>}
        jumpPrevIcon={<span>...</span>}
        pageSize={pageSize}
        total={totalRows}
        showSizeChanger={true}
        onShowSizeChange={handlePageSizeChange}
        pageSizeOptions={["10", "20", "50", "100"]}
        // hideOnSinglePage
        locale={{ items_per_page: "" }}
        showTotal={(total: number) => (
          <div className="flex items-center gap-1 h-full font-light text-gray-gray10 text-xs">
            <span>{total.toLocaleString("fa-IR")}</span>
            <span>سطر در</span>
            <span>{totalPages.toLocaleString("fa-IR")}</span>
            <span>صفحه</span>
          </div>
        )}
        onChange={handlePageChange}
        showTitle={false}
      />
    </div>
  );
}