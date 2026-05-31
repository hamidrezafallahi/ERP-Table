import React from 'react';

import { Spin } from 'antd';
import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import { SpinIcon } from '@components/atoms/iconComponents';
import { useCUDDataMutation } from '@services/base';
import {
  showErrorToast,
  showSuccessToast,
} from '@utils/toast';

import { DeleteNodeModalProps } from './type';

export default function DeleteOperation({
  onClose,
  sPlanOpcId,
}: DeleteNodeModalProps) {
  const t = useTranslations();
  const [triggerItem, { isLoading: triggerItemIsLoading }] =
    useCUDDataMutation();

  const handleDeleteConfirm = async () => {
    try {
      const handleDeleteRes: any = await triggerItem({
        url: "/api/prd/delete/sPlanOpc",
        body: {
          Id: sPlanOpcId,
        },
      }).unwrap();

      if (handleDeleteRes.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        onClose();
        onClose?.();
      }
    } catch (err) {
      showErrorToast(t("toast.failedTitle"));
      onClose();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mx-auto p-4 h-28">
      <p className="mx-4 text-sm text-center"> {t("general.deleteConfirm")}</p>
      <div className="flex justify-between gap-4 mt-4 w-full">
        <CustomButton
          className="bg-white border border-main-black !rounded w-full h-9 text-main-black"
          onClick={onClose}
        >
          {t("general.no")}
        </CustomButton>

        <CustomButton
          className="bg-main-black !rounded w-full h-9 text-white"
          onClick={handleDeleteConfirm}
        >
          {triggerItemIsLoading ? (
            <Spin size="large" indicator={<SpinIcon />} />
          ) : (
            t("general.yes")
          )}
        </CustomButton>
      </div>
    </div>
  );
}
