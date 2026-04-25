import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";
import { CustomButton } from "@components/atoms/defaultElements";
import { useAppSelector } from "@redux/index";
import { setPageData } from "@slice/pages";
import { ISelectOption } from "@type/elementType";
import { Skeleton } from "antd";
import { Dispatch, SetStateAction } from "react";

interface IProps {
  voucherTypeList: ISelectOption[];
  isFetching: boolean;
  setVoucherTypeId: Dispatch<SetStateAction<number>>;
}

export default function VoucherTypeList({
  voucherTypeList,
  isFetching,
  setVoucherTypeId,
}: IProps) {
  const dispatch = useDispatch();
  const t = useTranslations();

  const { selectedVoucherTypeId } = useAppSelector((state) => {
    const selectedVoucherTypeId = state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((pro) => pro.name == "selectedVoucherTypeId")?.value;
    return { selectedVoucherTypeId };
  }, shallowEqual);

  const handleVoucherTypeSelected = (e: ISelectOption) => {
    dispatch(
      setPageData({
        name: "selectedVoucherTypeId",
        value: e._SelectId,
      }),
    );
    setVoucherTypeId(e._SelectId);
  };

  return (
    <>
      {isFetching && voucherTypeList.length === 0 ? (
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
      ) : voucherTypeList.length > 0 ? (
        <div className="flex w-full flex-col gap-1 py-2 !h-full items-start overflow-auto">
          {voucherTypeList.map((voucherType, index) => (
            <div
              className="w-full border-b last:border-b-0"
              key={`${voucherType._SelectId}-${index}`}
            >
              <CustomButton
                type="text"
                className={`${
                  selectedVoucherTypeId === voucherType._SelectId &&
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
        <div className="flex justify-center items-center w-full">
          <p className="pt-10 text-gray-gray95 text-xs text-center">
            {t("general.notFoundData")}
          </p>
        </div>
      )}
    </>
  );
}
