import React, { Dispatch, SetStateAction } from "react";

import { Skeleton } from "antd";
import { shallowEqual, useDispatch } from "react-redux";

import { CustomButton } from "@components/atoms/defaultElements";
import { useAppSelector } from "@redux/index";
import { setPageData } from "@slice/pages";
import { ISelectOption } from "@type/elementType";

interface IProps {
  bankAccountList: ISelectOption[];
  showSkeleton: boolean;
  totalCount: number;
  setPage: Dispatch<SetStateAction<number>>;
  onSelectBankAccount?: (id: number) => void;
}

function InfiniteScrollGoodList({ ...props }: IProps) {
  const { bankAccountList, showSkeleton, totalCount, setPage } = props;
  const dispatch = useDispatch();
  const { selectedBankAccountId } = useAppSelector((state) => {
    const selectedBankAccountId = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((pro) => pro.name == "selectedBankAccountId")?.value;
    return { selectedBankAccountId };
  }, shallowEqual);

  const handleInfinite = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10 && !showSkeleton) {
      const receivedDataCount = bankAccountList?.length;
      if (totalCount > receivedDataCount) {
        setPage((prev) => prev + 1);
      }
    }
  };

  const handleBankAccountSelected = (e: ISelectOption) => {
    dispatch(
      setPageData({
        name: "selectedBankAccountId",
        value: e._SelectId,
      }),
    );
    dispatch(setPageData({ name: "selectedVersionId", value: undefined }));
    props.onSelectBankAccount?.(e._SelectId);
  };
  return (
    <div
      className="flex flex-col gap-2 p-2 !h-full overflow-auto"
      onScroll={handleInfinite}
    >
      {bankAccountList.map((bankAccount, index) => (
        <div className="border-b last:border-b-0" key={bankAccount._SelectId}>
          <CustomButton
            type="text"
            className={`${
              selectedBankAccountId == bankAccount._SelectId && "bg-blue-blue11"
            } mb-1 flex rounded-lg max-w-44 w-full  !min-h-10  text-xs `}
            onClick={() => handleBankAccountSelected(bankAccount)}
          >
            <span className="min-w-0 flex-1 text-right overflow-hidden whitespace-nowrap text-ellipsis block">
              {bankAccount._SelectDisplay}
            </span>
          </CustomButton>
        </div>
      ))}
      {showSkeleton && (
        <div className="right-0 bottom-0 left-0 z-10 flex flex-col gap-4 w-full">
          <Skeleton.Button active={true} style={{ width: "186px" }} />
          <Skeleton.Button active={true} style={{ width: "186px" }} />
          <Skeleton.Button active={true} style={{ width: "186px" }} />
          <Skeleton.Button active={true} style={{ width: "186px" }} />
        </div>
      )}
    </div>
  );
}

export default InfiniteScrollGoodList;
