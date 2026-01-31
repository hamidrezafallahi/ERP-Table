import React from 'react';

import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';

interface IProps {
  InviterName: string;
  onReject: () => void;
  onAccept: () => void;
}
const InviteStep = ({ ...props }: IProps) => {
  const { InviterName, onAccept, onReject } = props;
  const t = useTranslations();

  const handleDiscard = () => {
    onReject();
  };
  const handleAccept = () => {
    onAccept();
  };

  return (
    <>
      <div className="pt-9">
        <p className="font-medium text-gray-gray10 text-sm text-center">
          شخصی با نام {InviterName} شما را به حساب کاربری دعوت کرده است. آیا
          مایل به تأیید این دعوت و پیوستن به این حساب هستید؟
        </p>
      </div>
      <div className="flex gap-2">
        <CustomButton className="w-44 h-11" onClick={handleDiscard}>
          {t("general.discardInvite")}
        </CustomButton>
        <CustomButton
          onClick={handleAccept}
          className="bg-black-black9 hover:!bg-white dark:bg-gray-gray1 !border-none w-44 h-11 text-main-white hover:!text-black-black9 dark:!text-main-black transition-all"
        >
          {t("general.acceptAndContinue")}
        </CustomButton>
      </div>
    </>
  );
};

export default InviteStep;
