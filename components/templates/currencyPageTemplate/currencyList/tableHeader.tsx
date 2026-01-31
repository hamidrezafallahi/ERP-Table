import React from 'react';

import { useTranslations } from 'next-intl';

export default function TableHeader() {
  const t = useTranslations();
  return (
    <div className="hidden items-center sm:grid grid-cols-[100px_250px_1fr] mt-6 mb-4 px-2 sm:px-8 border border-gray-gray3 rounded-lg h-14">
      <p className="text-gray-gray10 dark:text-gray-gray1 text-xs text-right">
        {t("general.row")}
      </p>
      <p className="text-gray-gray10 dark:text-gray-gray1 text-xs text-right">
        {t("general.currencyType")}
      </p>
    </div>
  );
}
