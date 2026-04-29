import React, {
  Dispatch,
  SetStateAction,
} from 'react';

import { useTranslations } from 'next-intl';

import {
  CustomButton,
  CustomModal,
} from '@components/atoms/defaultElements';
import { ManagementAccount } from '@services/auth/base/type';

interface IManageAccounts {
  managementAccounts: ManagementAccount[];
  setAcceptAccountModalOpen: Dispatch<SetStateAction<boolean>>;
  acceptAccountModalOpen: boolean;
  setModalContent: Dispatch<SetStateAction<ManagementAccount>>;
  modalContent: ManagementAccount;
  handleLoginByAccount: (id: ManagementAccount) => void;
}
function ManagmentAccounts({ ...props }: IManageAccounts) {
  const {
    managementAccounts,
    handleLoginByAccount,
    setAcceptAccountModalOpen,
    setModalContent,
    modalContent,
    acceptAccountModalOpen,
  } = props;

  const t = useTranslations();
  const handleCancelAccount = () => {
    setAcceptAccountModalOpen(false);
    setModalContent(null);
  };
  const handleAcceptAccount = async (account: ManagementAccount) => {
    handleLoginByAccount(account);
  };
  const handleModalContent = (ManagementAccount) => {
    setAcceptAccountModalOpen(true);
    setModalContent(ManagementAccount);
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-6 pt-14 w-full h-[300px]">
        {managementAccounts?.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center bg-gray-gray2 px-2 border border-gray-gray11 rounded w-full h-16"
          >
            <div>{item.ManagementAccountDesc}</div>
            {!item.InActive ? (
              <CustomButton
                className="bg-main-black dark:bg-main-white text-main-white dark:text-main-black"
                type="text"
                //  disabled={isLoading}
                onClick={() => {
                  handleLoginByAccount(item);
                }}
              >
                {t("general.loggingIn")}
              </CustomButton>
            ) : (
              <CustomButton
                className="border hover:border-main-black hover:text-main-black"
                type="text"
                //  disabled={isLoading}
                onClick={() => handleModalContent(item)}
              >
                {t("general.pending")}
              </CustomButton>
            )}
          </div>
        ))}
      </div>
      <CustomModal
        width={300}
        centered
        disableTitle
        closeModal={() => {
          setAcceptAccountModalOpen(false);
        }}
        isModalOpen={acceptAccountModalOpen}
        content={
          <div
            className={`lg:p-4 flex flex-col justify-center items-center gap-2 px-4 rounded custom-confirm-modal`}
          >
            <span className="text-center">
              {t("general.activeAccount") +
                " " +
                modalContent?.ManagementAccountDesc +
                " " +
                t("general.areYouSureText")}
            </span>

            <div className="flex justify-between gap-4 mt-4 w-full">
              <CustomButton
                type="text"
                onClick={handleCancelAccount}
                className="bg-white px-10 py-2 border-2 border-black-black8 hover:border-black-black8 rounded w-full text-[12px] text-main-black"
              >
                {t("general.no")}
              </CustomButton>
              <CustomButton
                type="text"
                // loading={isLoading}
                // disabled={isLoading}
                onClick={() => handleAcceptAccount(modalContent)}
                className="bg-black-black8 hover:bg-white px-10 py-2 border hover:border-black-black8 rounded ring-0 w-full text-[12px] text-white"
              >
                {t("general.yes")}
              </CustomButton>
            </div>
          </div>
        }
      />
    </>
  );
}

export default ManagmentAccounts;
