import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { formatCurrency } from '@utils/core';

export default function Report() {
  const t = useTranslations();
     const {totalPrice, discountSum, items} = useAppSelector((state) => {
    const totalPrice=state.withPersist.pages?.find(item=>item.isActive)?.pageData?.find(i=>i.name === "totalPrice")?.value;
    const discountSum=state.withPersist.pages?.find(item=>item.isActive)?.pageData?.find(i=>i.name === "discountSum")?.value;
    const items=state.withPersist.pages?.find(item=>item.isActive)?.pageData?.find(i=>i.name === "items")?.value;
    return {totalPrice, discountSum, items};
  }, shallowEqual);
  const newTotalPrice = () => {
    if (
      !totalPrice ||
      isNaN(totalPrice) ||
      formatCurrency(totalPrice) === "ناعدد"
    ) {
      return 0;
    }
    return totalPrice;
  };

  return (
    <div className="hidden lg:flex flex-col justify-center items-center gap-2 border border-gray-gray10 dark:border-black-black0 rounded-lg w-3/5">
      <div className="font-bold text-gray-gray95 dark:text-white text-base">
        {" "}
        {t("general.payable")}
      </div>
      <div className="font-bold text-[32px] text-main-black dark:text-white">
        {formatCurrency(newTotalPrice())}
      </div>
      <div className="flex justify-between items-center px-2 w-full">
        {items?.length > 0 && (
          <div className="text-gray-gray10 dark:text-white">
            <span className="font-bold text-[26px] text-black-black7 dark:text-white">
              {items?.length}
            </span>{" "}
            {t("general.count")}
          </div>
        )}
        {discountSum > 0 && (
          <div className="text-state-success1 dark:text-white">
            {t("general.discount")}
            {formatCurrency(discountSum)}
          </div>
        )}
      </div>
    </div>
  );
}
