import React from 'react';

import { useTranslations } from 'next-intl';

export default function TableHeader() {
  const t = useTranslations();
  return (
    <div className="hidden items-center sm:grid grid-cols-[50px_150px_150px_1fr] mb-7 px-2 sm:px-4 border border-gray-gray3 rounded-lg h-12">
      <p className="text-gray-gray10 dark:text-gray-gray1 text-xs text-center">
        {t("general.row")}
      </p>
      <p className="text-gray-gray10 dark:text-gray-gray1 text-xs text-center">
        {t("general.username")}{" "}
      </p>
      <p className="text-gray-gray10 dark:text-gray-gray1 text-xs text-center">
        {t("general.phoneNumber")}{" "}
      </p>
    </div>
  );
}
