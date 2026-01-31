"use client";
import { shallowEqual } from "react-redux";

import { WarningCircleRed } from "@components/atoms/iconComponents/icons/WarningCircleRed";
import { useAppSelector } from "@redux/index";

export default function ToastError({ message, title }) {
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
