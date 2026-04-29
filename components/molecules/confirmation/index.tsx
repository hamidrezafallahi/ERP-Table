import { Spin } from 'antd';
import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import { SpinIcon } from '@components/atoms/iconComponents';

import type { IProps } from './type';

export default function Confirmation({
  itemsToConfirm,
  onCancel,
  onConfirm,
  onLoading,
  mode = "Delete",
}: IProps) {
  const t = useTranslations();

  const confirmationText =
    mode === "Delete"
      ? Array.isArray(itemsToConfirm) && itemsToConfirm?.length > 1
        ? t("general.multiDeleteConfirm", {
            path: `${itemsToConfirm?.length}`,
          })
        : t("general.deleteConfirm")
      : Array.isArray(itemsToConfirm) && itemsToConfirm?.length > 1
      ? t("general.multiConfirmText", {
          path: `${itemsToConfirm?.length}`,
        })
      : t("general.confirmText");

  return (
    <div
      className={`lg:p-4 flex flex-col justify-center items-center gap-2 rounded custom-confirm-modal`}
    >
      <span className="text-center">{confirmationText}</span>

      <div className="flex justify-between gap-4 mt-4 w-full">
        <CustomButton
          type="text"
          onClick={onCancel}
          className="bg-white px-10 py-2 border-2 border-black-black8 hover:border-black-black8 rounded w-full text-[12px] text-main-black"
        >
          {t("general.no")}
        </CustomButton>
        <CustomButton
          type="text"
          onClick={onConfirm}
          className="bg-black-black8 hover:bg-white px-10 py-2 border hover:border-black-black8 rounded ring-0 w-full text-[12px] text-white"
        >
          {onLoading ? (
            <Spin size="large" indicator={<SpinIcon />} />
          ) : (
            t("general.yes")
          )}
        </CustomButton>
      </div>
    </div>
  );
}
