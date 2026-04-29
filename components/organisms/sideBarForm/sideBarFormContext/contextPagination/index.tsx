import { CustomButton } from "@components/atoms/defaultElements";
import { LeftChevron, RightChevron } from "@components/atoms/iconComponents";
import { IBaseQueryResponse } from "@services/base/type";
import { Pagination } from "antd";
import IVoucherTypeItem from "../../type";
import { Dispatch, SetStateAction } from "react";

interface ContextPaginationProps {
  perPageCount: number;
  tableTotal: IBaseQueryResponse<IVoucherTypeItem[]>;
  tableData: IBaseQueryResponse<IVoucherTypeItem[]>;
  pageNumber: number;
  setPageNumber: Dispatch<SetStateAction<number>>;
}

export function ContextPagination({
  perPageCount,
  tableTotal,
  tableData,
  pageNumber,
  setPageNumber,
}: ContextPaginationProps) {
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
