import React from 'react';

import {
  Checkbox,
  Drawer,
} from 'antd';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import { useAppSelector } from '@hooks/custom/useAppSelector';

import { AccountInfo } from './type';

export default function ConfirmStep({
  account,
  searchedPhone,
  agree,
  setAgree,
  onTransfer,
  transferring,
}: {
  account: AccountInfo | null;
  searchedPhone: string;
  agree: boolean;
  setAgree: (v: boolean) => void;
  onTransfer: () => void;
  transferring: boolean;
}) {





  const t = useTranslations();
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  },shallowEqual);
 
  if (!account || searchedPhone !== account.phone) return null

  return (
    <div className="bg-gray-gray2 dark:bg-gray-gray11 mt-9 p-4 sm:p-5 border border-gray-gray11 dark:border-gray-gray1 rounded w-full sm:w-[495px]">
      <div className="flex justify-between sm:justify-start items-center gap-14 mb-3">
        <div className="font-medium text-gray-gray10 dark:text-gray-gray1 text-sm">
          {account.name}
        </div>
        <div className="font-medium text-gray-gray10 dark:text-gray-gray1 text-sm">
          {account.phone}
        </div>
      </div>

      <ol className="sm:space-y-2 pr-5 text-gray-gray10 dark:text-gray-gray1 text-xs leading-5 sm:leading-7 list-decimal">
        <li> {t("accountTransfer.text1")}</li>
        <li>
        {t("accountTransfer.text2")}
        </li>
        <li>
        {t("accountTransfer.text3")}
        </li>
        <li>
         {t("accountTransfer.text4")}
          <span className="block text-main-black sm:text-gray-gray10 dark:text-white">
          {t("accountTransfer.text5")}  
         </span>
        </li>
      </ol>

      <label className="flex items-center gap-2 mt-4">
        <Checkbox
          checked={agree}
          type="checkbox"
          className="border-gray-300 rounded w-4 h-4"
          onChange={(e) => setAgree(e.target.checked)}
        />
        <span className="font-medium text-gray-gray10 dark:text-gray-gray1 text-sm">
          {t("general.iHaveReadAndAgreeToTheAboveProvisions")}
        </span>
      </label>

      <div className="flex flex-col gap-2 px-2 w-full">
        {!match ? (
          <Drawer
            placement={"bottom"}
            closable={false}
            open
            mask={false}
            height={120}
            zIndex={22}
          >
            <div className="relative flex flex-col justify-center gap-4 !h-full overflow-hidden">
              <CustomButton
                onClick={onTransfer}
                disabled={!agree || transferring}
                className={`     
                } bg-main-black w-full h-11 font-medium text-md text-white`}
              >
                {transferring ? t("general.transferring")  : t("title.transfer")}
              </CustomButton>
            </div>
          </Drawer>
        ) : (
          <div className="flex justify-end items-center gap-3 mt-4">
            <CustomButton
              onClick={onTransfer}
              disabled={!agree || transferring}
              className="bg-main-black disabled:bg-gray-gray55 rounded w-16 h-9 text-white disabled:text-gray-gray8 text-xs disabled:cursor-not-allowed"
            >
              {transferring ? t("general.transferring") :t("title.transfer")}
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
}
