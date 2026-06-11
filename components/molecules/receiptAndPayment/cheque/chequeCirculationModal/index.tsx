import { useState } from "react";

import { shallowEqual } from "react-redux";

import { CustomTooltip } from "@components/atoms/defaultElements";
import { InfoIcon } from "@components/atoms/iconComponents";
import { useAppSelector } from "@hooks/custom/useAppSelector";
import { useGetData } from "@services/base";
import {
  IChequeHistory,
  PassedTypeEnum,
  StateTypeEnum,
} from "@services/trh/receivedCheque/type";
import { convertDate } from "@utils/core";

import { ChequeInfoModal } from "../chequeInfoModal";
import type { IProps } from "./type";

export const ChequeCirculationModal = ({ id }: IProps) => {
  const { locale } = useAppSelector((state) => {
    return {
      locale: state.withPersist.config?.lang,
    };
  }, shallowEqual);

  const [selectedId, setSelectedId] = useState<number>(null);

  const { data: infoData } = useGetData<IChequeHistory[], null>({
    url: "api/trh/select/chequeHistory",
    body: {
      Id: id,
    },
    id: id,
    skip: !id,
  });
  const data = infoData?.Data;

  const findState = (stateId, passedId) => {
    switch (stateId) {
      case StateTypeEnum.Bank:
        return "نزد بانک";
      case StateTypeEnum.CashDesk:
        return "نزد صندوق";
      case StateTypeEnum.Collected:
        if (passedId === PassedTypeEnum.CashierPassed) {
          return "وصول شده توسط صندوقدار";
        }
        if (passedId === PassedTypeEnum.DirectPassed) {
          return "وصول شده (مستقیم)";
        }
        if (passedId === PassedTypeEnum.TankhahDarPassed) {
          return "وصول شده توسط تنخواه دار";
        }
        return "وصول شده (نا مشخص)";
      case StateTypeEnum.Person:
        return "نزد شخص";
      case StateTypeEnum.Tankhah:
        return "نزد تنخواه";
      case StateTypeEnum.Returned:
        return "استرداد شده";
      default:
        return "نا مشخص";
    }
  };

  return (
    <div className="flex flex-col justify-between gap-2 text-xs">
      <div className="gap-4 grid grid-cols-6 bg-gray-gray3 p-2 rounded text-gray-gray8">
        <span>ردیف</span>
        <span className="col-span-3">وضعیت</span>
        <span>تاریخ</span>
        <span>جزئیات</span>
      </div>
      <div className="h-[180px] overflow-y-auto">
        {data?.map((el, idx) => (
          <div
            className={`gap-4 grid grid-cols-6 p-2 ${
              el.IsReturned && "text-gray-gray6"
            }`}
            key={idx}
          >
            <span className="">{idx + 1}</span>
            <span className="col-span-3">
              {findState(el?.StateId, el.PassedType)}
            </span>
            <span>
              {convertDate({
                dateString: el?.DocumentCheque?.CreateDate,
                locale: locale,
              })}
            </span>
            {el.StateId !== StateTypeEnum.CashDesk && (
              <CustomTooltip
                title={<ChequeInfoModal id={selectedId} withoutButton />}
              >
                <span
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedId(el.DocumentCheque.DocumentChequeId);
                    // setInfoModalIsOpen(true);
                  }}
                >
                  <InfoIcon
                    config={{ stroke: "#595959", width: 20, height: 20 }}
                  />
                </span>
              </CustomTooltip>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
