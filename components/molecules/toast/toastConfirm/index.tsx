"use client";

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  WarningTriangle,
} from '@components/atoms/iconComponents/icons/WarningTriangle';
import { useAppSelector } from '@hooks/custom/useAppSelector';

export default function ToastConfirm({ message, title, handleConfirm }) {
  const t = useTranslations();

  const { match ,lang} = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const lang = state.withPersist.config.lang;
    return { match ,lang};
  },shallowEqual);

  return match ? (
    <div
      className={`${
        lang === "fa" ? "font-IRANSans" : "font-en"
      } flex flex-col gap-4`}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <WarningTriangle />
          {title && (
            <div className="font-medium text-gray-gray10 text-base">
              {title}
            </div>
          )}
        </div>
        <div className="ps-4 w-[300px] font-normal text-gray-gray9 text-sm">
          {message ? (
            Array.isArray(message) ? (
              <>
                {" "}
                {message.map((mess, index) => (
                  <div key={index}>
                    {index + 1}
                    {" _ "}
                    {mess}
                  </div>
                ))}{" "}
              </>
            ) : (
              message
            )
          ) : (
            t("general.confirmText")
          )}
        </div>
      </div>
      <div className="flex flex-row-reverse justify-start gap-4 h-8">
        <CustomButton
          onClick={handleConfirm}
          className="flex justify-center items-center bg-black-black8 !hover:bg-white px-3 py-2 hover:!border-black-black8 rounded w-[88px] h-full text-[12px] text-white hover:!text-black-black8"
        >
          {t("general.accept")}
        </CustomButton>
      </div>
    </div>
  ) : (
    <div
      className={`${
        lang === "fa" ? "font-IRANSans" : "font-en"
      } flex flex-col gap-2`}
    >
      <div className="flex items-center gap-2">
        <WarningTriangle />
        <div className="ps-4 w-[calc(100dvw-140px)] font-normal text-[12px] text-gray-gray9">
          {message ? (
            Array.isArray(message) ? (
              <>
                {" "}
                {message.map((mess, index) => (
                  <div key={index}>{mess}</div>
                ))}{" "}
              </>
            ) : (
              message
            )
          ) : (
            t("general.confirmText")
          )}
        </div>
      </div>
      <div className="flex flex-row-reverse justify-start gap-4 h-8">
        <CustomButton
          onClick={handleConfirm}
          className="flex justify-center items-center bg-black-black8 !hover:bg-white px-3 py-2 hover:!border-black-black8 rounded w-[88px] h-full text-white hover:!text-black-black8 text-sm"
        >
          {t("general.accept")}
        </CustomButton>
      </div>
    </div>
  );
}
