import { useTranslations } from "next-intl";

import { CustomerIcon } from "@components/atoms/iconComponents";

export const CustomerInfo = () => {
  const t = useTranslations();

  return (
    <div className="flex flex-col gap-2 text-xs">
      <div className="flex gap-2">
        <CustomerIcon />
        <span className="text-sm">{t("general.customerInfo")}</span>
      </div>
      <div className="flex justify-between p-2 border border-1 border-gray-gray55 rounded-xl">
        <div className="flex gap-6">
          <span>{t("general.sumOfSales")}</span>
          <span>-</span>
        </div>
        <div className="flex gap-6">
          <span>{t("general.sumOfVoucher")}</span>
          <span>-</span>
        </div>
        <div className="flex gap-6">
          <span>{t("general.cashReceipt")}</span>
          <span>-</span>
        </div>
        <div className="flex gap-6">
          <span className="">{t("general.validity")}</span>
          <span>-</span>
        </div>
        <div className="flex gap-6">
          <span className="font-bold">{t("general.debtBalance")}</span>
          <span className="font-bold">-</span>
        </div>
      </div>
    </div>
  );
};
