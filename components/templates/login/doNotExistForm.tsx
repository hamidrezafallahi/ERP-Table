import React from "react";

import { useTranslations } from "next-intl";

import { CustomButton } from "@components/atoms/defaultElements";

interface DoNotExistFormProps {
  isLoading?: boolean;
  onFinish?: () => void;
}
const DoNotExistForm: React.FC<DoNotExistFormProps> = ({
  isLoading,
  onFinish,
}) => {
  const t = useTranslations();
  return (
    <>
      <div className="pt-7 pb-4 font-normal text-gray-gray10 text-sm text-center">
        <p>شما در هیچ حسابی عضویت ندارید.</p>
        <p>اگر صاحب یا نماینده یک کسب و کار هستید، میتوانید یک حساب </p>
        <p>برای کسب و کار خودتان بسازید !</p>
        <p>اگر از پرسنل یک کسب و کار هستید، منتظر دریافت دعوتنامه بمانید.</p>
      </div>
      <CustomButton
        className="bg-black-black9 hover:!bg-white dark:bg-gray-gray1 !border-none w-full h-12 text-main-white hover:!text-black-black9 dark:!text-main-black transition-all"
        htmlType="submit"
        disabled={isLoading}
        onClick={onFinish}
      >
        {t("general.addAccount")}
      </CustomButton>
    </>
  );
};

export default DoNotExistForm;
