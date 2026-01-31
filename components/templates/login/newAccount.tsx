import React from 'react';

import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';

const NewAccount = () => {
  const t = useTranslations();
  return (
    <div className="pt-9">
      <div className="font-medium text-gray-gray10 text-base text-center">
        <p>آیا تمایل به ساخت اکانت جدید برای کسب و کار</p>
        <p className="pb-7"> خودتان دارید ؟</p>
      </div>
      <div className="flex gap-2">
        <CustomButton className="w-full h-12">{t("general.no")}</CustomButton>
        <CustomButton className="bg-black-black9 hover:!bg-white dark:bg-gray-gray1 !border-none w-full h-12 text-main-white hover:!text-black-black9 dark:!text-main-black transition-all">
          {t("general.yes")}
        </CustomButton>
      </div>
    </div>
  );
};

export default NewAccount;
