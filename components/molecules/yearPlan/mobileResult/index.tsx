import { useTranslations } from "next-intl";

export const MobileResult = ({ totalDebit, totalCredit, balance }) => {
  const t = useTranslations();
  return (
    <>
      <div className="flex flex-col justify-center gap-2 scrollbar-hidden">
        <div className="flex justify-between gap-2 text-sm">
          <span>{t("general.debit")}</span>
          <span className="flex gap-2 text-sm">
            {totalDebit.toLocaleString("fa-IR")}
          </span>
        </div>
        <div className="flex justify-between gap-2 text-sm">
          <span>{t("general.credit")}</span>
          <span className="flex gap-2 text-sm">
            {totalCredit.toLocaleString("fa-IR")}
          </span>
        </div>
        <div className="flex justify-between gap-2 text-sm">
          <span>{t("general.balance")}</span>
          <span
            className={`${
              balance === 0 ? "text-green-600" : "text-red-600"
            } flex gap-2 text-sm`}
          >
            {balance.toLocaleString("fa-IR")}
          </span>
        </div>
      </div>
    </>
  );
};
