import React, { FC } from 'react';

import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';

interface IWelcome {
  onFinish: () => void;
}

const WelcomeStep: FC<IWelcome> = ({ onFinish }) => {
  const t = useTranslations();
  return (
    <>
      <div className="pt-8">
        <p className="flex justify-center font-medium text-gray-gray10 text-base">
          رمز عبور شما با موفقیت ثبت شد.{" "}
        </p>
        <p className="pb-6 font-medium text-main-black text-lg">
          اکنون می‌توانید وارد سیستم شوید. خوش آمدید
        </p>
      </div>
      <div className="flex gap-2">
        <CustomButton
          className="bg-black-black9 hover:!bg-white dark:bg-gray-gray1 !border-none w-[400px] h-11 text-main-white hover:!text-black-black9 dark:!text-main-black transition-all"
          htmlType="submit"
          onClick={onFinish}
        >
          {t("general.loggingIn")}
        </CustomButton>
      </div>
    </>
  );
};

export default WelcomeStep;
