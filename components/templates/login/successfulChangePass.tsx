import React from 'react';

import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  CloseModalIcon,
  DoubleTick,
} from '@components/atoms/iconComponents';

type SuccessfulChangePassProps = {
  onClick: () => void;
  onClose: () => void;
};

function SuccessfulChangePass({ onClick, onClose }: SuccessfulChangePassProps) {
  const t = useTranslations();

  return (
    <>
      <div className="top-4 right-4 absolute cursor-pointer" onClick={onClose}>
        <CloseModalIcon />
      </div>

      <div className="flex justify-center pb-4 w-full">
        <DoubleTick />
      </div>

      <div className="flex justify-center pb-10 w-full font-medium text-gray-gray9 text-xl">
        {t("general.successfullyChangePass")}
      </div>

      <CustomButton
        className="bg-black-black9 hover:!bg-white dark:bg-gray-gray1 !border-none w-full h-12 text-main-white hover:!text-black-black9 dark:!text-main-black"
        htmlType="submit"
        onClick={onClick}
      >
        {t("general.acceptAndContinue")}
      </CustomButton>
    </>
  );
}

export default SuccessfulChangePass;
