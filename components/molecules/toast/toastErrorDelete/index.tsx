"use client";

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { WarningCircleRed } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import type { IDeleteData } from '@services/auth/base/type';

export default function ToastErrorDelete({
  message,
  title,
  deleteData,
}: {
  message: string;
  title: string;
  deleteData: IDeleteData[];
}) {
  const t = useTranslations();
  const { match, lang } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const lang = state.withPersist.config.lang;
    return { match, lang };
  }, shallowEqual);

  return match ? (
    <div
      className={`${lang === "fa" ? "font-IRANSans" : "font-en"} relative p-2 `}
    >
      <div className="-z-10 absolute -inset-10 bg-state-error7"></div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <WarningCircleRed />
          <div className="font-medium text-state-error1 text-base">{title}</div>
        </div>
        <div className="ps-4 w-[300px] font-normal text-gray-gray9 text-sm">
          {message}
        </div>
        {deleteData?.length > 0 && (
          <div className="ps-4 w-[200px] font-normal text-gray-gray9 text-sm">
            <p className="font-medium text-state-error1 text-sm">
              {t("toast.usedParts")}
            </p>
            <ol>
              {deleteData?.map((el, idx) => (
                <li className="list-disc" key={idx}>
                  {el?.TableDesc}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  ) : (
    <div className={`${lang === "fa" ? "font-IRANSans" : "font-en"} relative`}>
      <div className="-z-10 absolute -inset-9 bg-state-error7"></div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <WarningCircleRed />
          <div className="w-[calc(100dvw-110px)] font-normal text-[12px] text-state-error1">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}
