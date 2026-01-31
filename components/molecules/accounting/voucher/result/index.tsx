import { FC } from "react";

import { useTranslations } from "next-intl";

import type { IProps } from "./type";

export const VoucherResult: FC<IProps> = ({
  totalDebit,
  totalCredit,
  balance,
}) => {
  const t = useTranslations();

  return (
    <div className="flex justify-end gap-2">
      <div className="flex flex-col gap-2 w-[175px] text-sm">
        <span>{t("general.debit")}</span>
        <span className="bg-gray-gray5 p-2 rounded text-base">
          {totalDebit.toLocaleString("fa-IR")}
        </span>
      </div>
      <div className="flex flex-col gap-2 w-[175px] text-sm">
        <span>{t("general.credit")}</span>
        <span className="bg-gray-gray5 p-2 rounded text-base">
          {totalCredit.toLocaleString("fa-IR")}
        </span>
      </div>
      <div className="flex flex-col gap-2 w-[175px] text-sm">
        <span>{t("general.balance")}</span>
        <span
          className={`${
            balance === 0 ? "text-green-600" : "text-red-600"
          } p-2 rounded bg-gray-gray5 text-base`}
        >
          {balance.toLocaleString("fa-IR")}
        </span>
      </div>
    </div>
  );
};
