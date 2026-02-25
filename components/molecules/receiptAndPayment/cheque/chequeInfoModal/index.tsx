import { shallowEqual } from "react-redux";

import { CustomButton } from "@components/atoms/defaultElements";
import { useAppSelector } from "@redux/index";
import { useGetData } from "@services/base";
import type { IChequeInfo } from "@services/trh/receivedCheque/type";
import { convertDate } from "@utils/core";

import type { IProps } from "./type";

export const ChequeInfoModal = ({
  handlePrevStep,
  id,
  mutateIsLoading,
  withoutButton = false,
}: IProps) => {
  const { locale } = useAppSelector((state) => {
    return {
      locale: state.withPersist.config.lang,
    };
  }, shallowEqual);

  const { data: infoData } = useGetData<IChequeInfo[], null>({
    url: "api/trh/select/chequeInfo",
    body: {
      Id: id,
    },
    id: id,
    skip: !id,
  });

  const data = infoData?.Data[0];

  return (
    <div className="flex flex-col justify-between gap-2 p-4 text-xs">
      <div className="gap-4 grid grid-cols-2">
        {data?.VoucherDate && (
          <div className="flex gap-2">
            <span className="text-gray-gray85">تاریخ :</span>
            <span className="font-bold">
              {convertDate({
                dateString: data?.VoucherDate,
                locale: locale,
              })}
            </span>
          </div>
        )}
        {data?.VoucherDesc && (
          <div className="flex gap-2">
            <span className="text-gray-gray85">شرح :</span>
            <span className="font-bold">{data?.VoucherDesc}</span>
          </div>
        )}
        {data?.BankDesc && (
          <div className="flex gap-2">
            <span className="text-gray-gray85">حساب :</span>
            <span className="font-bold">{data?.BankDesc}</span>
          </div>
        )}
        {data?.RpWayDesc && (
          <div className="flex gap-2">
            <span className="text-gray-gray85">نحوه دریافت و پرداخت :</span>
            <span className="font-bold">{data?.RpWayDesc}</span>
          </div>
        )}
        {data?.TafsiliDesc && (
          <div className="flex gap-2">
            <span className="text-gray-gray85">صادرکننده چک :</span>
            <span className="font-bold">{data?.TafsiliDesc}</span>
          </div>
        )}
        {data?.CashierDesc && (
          <div className="flex gap-2">
            <span className="text-gray-gray85">صندوقدار :</span>
            <span className="font-bold">{data?.CashierDesc}</span>
          </div>
        )}
        {data?.TankhahdarDesc && (
          <div className="flex gap-2">
            <span className="text-gray-gray85">تنخواه دار :</span>
            <span className="font-bold">{data?.TankhahdarDesc}</span>
          </div>
        )}
      </div>
      {!withoutButton && (
        <div className="flex justify-end items-center">
          <CustomButton
            type="text"
            onClick={() => handlePrevStep()}
            loading={mutateIsLoading}
            className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
          >
            برگشت به مرحله قبل
          </CustomButton>
        </div>
      )}
    </div>
  );
};
