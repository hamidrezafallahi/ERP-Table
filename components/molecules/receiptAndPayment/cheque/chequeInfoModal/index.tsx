import { CustomButton } from "@components/atoms/defaultElements";
import { useAppSelector } from "@redux/index";
import { convertDate } from "@utils/core";
import { shallowEqual } from "react-redux";
import type { IProps } from "./type";

export const ChequeInfoModal = ({ handlePrevStep, data }: IProps) => {
  const { locale } = useAppSelector((state) => {
    return {
      locale: state.withPersist.config.lang,
    };
  }, shallowEqual);

  return (
    <div className="flex flex-col justify-between gap-2 p-4 text-xs">
      <div className="grid grid-cols-2">
        {data?.DocumentCheque?.CreateDate && (
          <div className="flex gap-2">
            <span>تاریخ :</span>
            <span>
              {convertDate({
                dateString: data?.DocumentCheque?.CreateDate,
                locale: locale,
              })}
            </span>
          </div>
        )}
        {data?.DetailDesc && (
          <div className="flex gap-2">
            <span>شرح :</span>
            <span>{data?.DetailDesc}</span>
          </div>
        )}
      </div>
      <div className="flex justify-end items-center">
        <CustomButton
          type="text"
          onClick={() => handlePrevStep()}
          className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
        >
          برگشت به مرحله قبل
        </CustomButton>
      </div>
    </div>
  );
};
