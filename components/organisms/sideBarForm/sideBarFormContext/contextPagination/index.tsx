import { CustomButton } from "@components/atoms/defaultElements";
import { LeftChevron, RightChevron } from "@components/atoms/iconComponents";
import { Pagination } from "antd";
import { Dispatch, SetStateAction } from "react";

interface ContextPaginationProps {
  perPageCount: number;
  tableTotal: any;
  tableData: any;
  pageNumber: number;
  setPageNumber: Dispatch<SetStateAction<number>>;
}

export function ContextPagination(props: ContextPaginationProps) {
  const { perPageCount, tableTotal, tableData, pageNumber, setPageNumber } =
    props;
  if (!tableData || tableTotal?.TotalCount < perPageCount) return null;
  return (
    <Pagination
      className="flex justify-end"
      prevIcon={
        <CustomButton className="self-end m-0 p-0 rounded w-fit">
          <RightChevron />
        </CustomButton>
      }
      nextIcon={
        <CustomButton className="m-0 p-0 w-fit">
          <LeftChevron />
        </CustomButton>
      }
      current={pageNumber}
      jumpNextIcon={<span>...</span>}
      jumpPrevIcon={<span>...</span>}
      pageSize={perPageCount}
      total={tableTotal?.TotalCount}
      showSizeChanger={false}
      onChange={(page) => setPageNumber(page)}
      showTitle={false}
    />
  );
}
