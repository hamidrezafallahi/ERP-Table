import React from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  CustomButton,
  CustomModal,
} from '@components/atoms/defaultElements';
import { CloseSm } from '@components/atoms/iconComponents';
import { useAppSelector } from '@redux/index';

import { User } from './userRow';

interface Props {
  user: User | null;
  visible: boolean;
  onClose: () => void;
  onConfirm: (accountID: number, user: User) => void;
}

export default function SelectedUserModal({
  user,
  visible,
  onClose,
  onConfirm,
}: Props) {
  const t = useTranslations();
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);
  if (!user) return null;

  return (
    <CustomModal
      contentClassName={`${match && "w-[527px] h-[300px]"}`}
      closeModal={onClose}
      closeIcon={null}
      isModalOpen={visible}
      headerIcon={
        <div className="lg:hidden top-4 left-4 absolute" onClick={onClose}>
          <CloseSm />
        </div>
      }
      content={
        <div className="flex flex-col justify-center items-center gap-8 px-3 lg:px-28 py-16 text-center">
          {!user.IsAdmin ? (
            <p>
           {t("general.byChangingTheMainUserTo")}
              {user.FullName}
              
           {t("general.fromNowOnYouWillNoLonger")}
            {t("general.featuresExclusiveToTheMainUserIncluding")}
              <strong>{t("general.changePackage")}</strong>،<strong> {t("general.accessManagement")}</strong> {t("general.and")}  
              {t("general.other")}
              <strong>{t("general.administrativeSettings")}</strong>،{t("general.youWillNotHaveAccess")}
            </p>
          ) : (
            <p>
           {t("general.selectedUserModalConfirmText")}

              « {user.FullName} » 
             {t("general.to")}
              <strong> {t("general.administrativeSettings")} </strong> ، <strong> {t("general.changingPackages")} </strong>{" "}
              ، {t("general.and")} {" "}
              <strong>{t("general.specialSections")}</strong>{" "}
           {t("general.andTheMainUserWillNotHaveAccess")}
            </p>
          )}

          <div className="flex justify-center gap-3">
            <CustomButton
              type="text"
              onClick={onClose}
              className="bg-white dark:!bg-gray-gray10 px-3 py-1 border border-black-black8 rounded lg:w-44 min-w-24 text-black-black8 dark:text-gray-gray1 text-xs"
            >
              {t("general.cancel")}{" "}
            </CustomButton>
            <CustomButton
              htmlType="submit"
              type="text"
              onClick={() => {
                if (user) {
                  onConfirm(user.UserId, user);
                }
                onClose();
              }}
              className="bg-black-black8 hover:bg-white dark:!bg-gray-gray10 px-3 py-1 border hover:border-black-black8 rounded lg:w-44 min-w-24 text-white hover:text-black-black8 text-xs"
            >
              {t("general.accept")}{" "}
            </CustomButton>
          </div>
        </div>
      }
    />
  );
}
