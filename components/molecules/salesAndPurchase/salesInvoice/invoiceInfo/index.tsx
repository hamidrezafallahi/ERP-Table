import { Divider } from 'antd';
import { useTranslations } from 'next-intl';

import { LicenseIcon } from '@components/atoms/iconComponents';

import type { IProps } from './type';

export const InvoiceInfo = ({ totalValues, totalOtherValues }: IProps) => {
  const t = useTranslations();

  const totalAmount =
    (totalValues?.totalDetailAmount || 0) +
    (totalValues?.totalDetailAdditionalAmount || 0);

  const additionsAmount =
    (totalValues?.detailIncreasing || 0) +
    (totalOtherValues?.otherIncreasing || 0) +
    (totalOtherValues?.taxes || 0);

  const deductionsAmount =
    (totalValues?.detailDecreasing || 0) +
    (totalOtherValues?.otherDecreasing || 0) +
    (totalOtherValues?.discounts || 0);
  const amountPayable = totalAmount + additionsAmount - deductionsAmount;

  return (
    <div className="flex flex-col gap-2 text-xs">
      <div className="flex gap-2">
        <LicenseIcon />
        <span className="text-sm">{t("general.invoiceInfo")}</span>
      </div>
      <div className="flex flex-col justify-between p-2 border border-1 border-gray-gray55 rounded-xl">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span>{t("general.sumOfPrice")}</span>
            <span>
              {totalAmount ? totalAmount?.toLocaleString("fa-IR") : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t("general.sumOfDeductions")}</span>
            <span className="text-green-600">
              {deductionsAmount
                ? deductionsAmount?.toLocaleString("fa-IR")
                : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>{t("general.sumOfAdditions")}</span>
            <span className="text-red-600">
              {additionsAmount ? additionsAmount?.toLocaleString("fa-IR") : "-"}
            </span>
          </div>
          <Divider className="m-0 py-[1px]" type="horizontal" />
          <div className="flex justify-between">
            <span>{t("general.amountPayable")}</span>
            <span>
              {amountPayable ? amountPayable?.toLocaleString("fa-IR") : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
