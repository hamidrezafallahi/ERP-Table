import React, {
  Dispatch,
  SetStateAction,
} from 'react';

import { CustomButton } from '@components/atoms/defaultElements';

import StatusDot from './statusDot';
import {
  AccountInfo,
  Step,
} from './type';
import { useTranslations } from 'next-intl';

function Divider() {
  return (
    <div className="sm:mx-1 border-gray-300 border-t-2 border-dashed h-px grow" />
  );
}

export default function StatusStep({
  account,
  status,
  setStep,
  setSelectedIds,
}: {
  account: AccountInfo | null;
  status: { request: boolean; user: boolean; company: boolean };
  setStep: Dispatch<SetStateAction<Step>>;
  setSelectedIds;
}) {
  const t = useTranslations();
  if (!account) return null;
  return (
    <>
      <div className="bg-gray-gray2 dark:bg-gray-gray11 mt-28 p-2 sm:p-5 border border-gray-gray11 rounded">
        <div className="flex justify-between sm:justify-start items-center sm:gap-14 mb-3 font-medium text-sm text-nowrap">
          <span> {t("general.transferAccountTo")}{account.name}</span>
          <span className="text-gray-600 dark:text-gray-gray1 text-nowrap">
            {account.phone}
          </span>
        </div>

        <div className="relative flex justify-center items-center sm:gap-3 mt-10 px-10 h-6">
          <StatusDot active={status.request} label={t("general.transferRequest")} />
          <Divider />
          <StatusDot active={status.user} label={t("general.accountUserVerification")} />
          <Divider />
          <StatusDot active={status.company} label={t("general.azmounTekCompanyApproval")}/>
        </div>
      </div>
      <div className="flex justify-end items-end mt-3">
        <CustomButton
          className="bg-main-black w-full !w-fit min-w-20 !px-3 text-white text-xs"
          onClick={() => {
            setStep("pick");
            setSelectedIds([]);
          }}
        >
         {t("general.cancelProcess")} 
        </CustomButton>
      </div>
    </>
  );
}
