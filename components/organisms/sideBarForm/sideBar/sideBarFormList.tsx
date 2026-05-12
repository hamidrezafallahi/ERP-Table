import { useTranslations } from "next-intl";
import { useDispatch } from "react-redux";
import { CustomButton } from "@components/atoms/defaultElements";
import { setPageData } from "@slice/pages";
import { ISelectOption } from "@type/elementType";
import { Skeleton } from "antd";
import { Dispatch, SetStateAction } from "react";

interface SideBarFormListIProps {
  dataList: ISelectOption[];
  isFetching: boolean;
  setTypeId: Dispatch<SetStateAction<number | undefined>>;
  idFieldName: string;
  typeId: number;
}

export default function SideBarFormList({
  dataList,
  isFetching,
  setTypeId,
  typeId,
}: SideBarFormListIProps) {
  const dispatch = useDispatch();
  const t = useTranslations();

  const handleVoucherTypeSelected = (e: ISelectOption) => {
    dispatch(
      setPageData({
        name: "selectedId",
        value: e._SelectId,
      }),
    );
    setTypeId(e._SelectId);
  };

  const sortedDataList = [...dataList].sort(
    (a, b) => a._SelectId - b._SelectId,
  );

  return (
    <>
      {isFetching && dataList.length > 0 ? (
        <div className="flex flex-col gap-4 w-full">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton.Button
              key={i}
              active
              style={{ width: "100%", minHeight: "2.5rem" }}
            />
          ))}
          <span className="text-xs text-gray-500 mr-2">در حال بارگذاری...</span>
        </div>
      ) : dataList.length > 0 ? (
        <div className="flex w-full flex-col gap-1 !h-full items-start overflow-auto">
          {sortedDataList.map((voucherType, index) => (
            <div
              className="w-full border-b last:border-b-0"
              key={`${voucherType._SelectId}-${index}`}
            >
              <CustomButton
                type="text"
                className={`${
                  typeId === voucherType._SelectId &&
                  "!bg-blue-blue11 hover:!bg-blue-blue11"
                } mb-1 rounded-md w-full bg-transparent justify-start px-1 !min-h-10`}
                onClick={() => handleVoucherTypeSelected(voucherType)}
              >
                {voucherType._SelectValue}
              </CustomButton>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center w-full h-full">
          <p className="text-gray-gray95 text-xs text-center">
            {t("general.notFoundData")}
          </p>
        </div>
      )}
    </>
  );
}
