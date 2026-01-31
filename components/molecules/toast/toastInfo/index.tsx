"use client";

import { shallowEqual } from "react-redux";

import { Info } from "@components/atoms/iconComponents";
import { useDarkMode } from "@hooks/custom";
import { useAppSelector } from "@redux/index";

export default function ToastInfo({ title, message }) {
  const { mode = "light" } = useDarkMode();

  const { match, lang } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const lang = state.withPersist.config.lang;
    return { match, lang };
  }, shallowEqual);

  return match ? (
    <div
      className={`${lang === "fa" ? "font-IRANSans" : "font-en"} relative p-2 `}
    >
      <div className="-z-10 absolute -inset-10 bg-blue-blue005 dark:bg-blue-950"></div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Info
            config={{
              width: 24,
              height: 24,
              stroke: mode === "dark" ? "#FBFBFB" : "#086EDC",
            }}
          />
          <div className="font-medium text-blue-blue5 dark:text-blue-200 text-base">
            {title}
          </div>
        </div>
        <div className="ps-4 w-[300px] font-normal text-gray-gray9 dark:text-white text-sm">
          {message}
        </div>
      </div>
    </div>
  ) : (
    <div className={`${lang === "fa" ? "font-IRANSans" : "font-en"} relative`}>
      <div className="-z-10 absolute -inset-9 bg-blue-blue005 dark:bg-blue-950"></div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Info
            config={{
              width: 24,
              height: 24,
              stroke: mode === "dark" ? "#fff" : "#086EDC",
            }}
          />
          <div className="w-[calc(100dvw-110px)] font-normal text-[12px] text-blue-blue5 dark:text-blue-200">
            {message}
          </div>
        </div>
      </div>
    </div>
  );
}
