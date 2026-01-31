import React, {
  Dispatch,
  SetStateAction,
} from 'react';

import { Skeleton } from 'antd';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { useAppSelector } from '@redux/index';
import { setPageData } from '@slice/pages';
import { ISelectOption } from '@type/elementType';

interface IProps {
  onChangePage: () => void;
  goodList: ISelectOption[];
  showSkeleton: boolean;
  totalCount: number;
  setPage: Dispatch<SetStateAction<number>>;
}

function InfiniteScrollGoodList({ ...props }: IProps) {
  const { goodList, onChangePage, showSkeleton, totalCount, setPage } = props;
  const dispatch = useDispatch();
  const { selectedGoodId } = useAppSelector((state) => {
    const selectedGoodId = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((pro) => pro.name == "selectedGoodId")?.value;
    return { selectedGoodId };
  }, shallowEqual);

  const handleInfinite = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10 && !showSkeleton) {
      const receivedDataCount = goodList?.length;
      if (totalCount > receivedDataCount) {
        setPage((prev) => prev + 1);
      }
    }
  };

  const handleGoodSelected = (e: ISelectOption) => {
    dispatch(
      setPageData({
        name: "selectedGoodId",
        value: e._SelectId,
      })
    );
    dispatch(setPageData({ name: "selectedVersionId", value: undefined }));
  };
  return (
    <div
      className="flex flex-col gap-2 p-2 !h-full overflow-auto"
      onScroll={handleInfinite}
    >
      {goodList.map((good, index) => (
        <div className="border-b last:border-b-0" key={index}>
          <CustomButton
            type="text"
            className={`${
              selectedGoodId == good._SelectId && "bg-blue-blue11"
            } mb-1 rounded-lg w-full !min-h-10`}
            onClick={() => handleGoodSelected(good)}
          >
            {good._SelectDisplay}
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
