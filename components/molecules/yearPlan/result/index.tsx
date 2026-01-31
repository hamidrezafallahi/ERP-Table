"use client";
import { useTranslations } from "next-intl";
import { IProps } from "./type";
import { useSearchParams } from "next/navigation";
export function YearPlanResult({
  columnSums,
  fullScreen,
  minimizePanel,
}: IProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const showHistoryMode = searchParams.get("mode");

  const isReadOnly = showHistoryMode === "showHistory";
  return (
    <div className={`flex items-center gap-2 w-full   ${isReadOnly ? " opacity-55  cursor-not-allowed" : ""}  `}>
      <div
        className={`${
          fullScreen
            ? "w-full"
            : `${
                minimizePanel
                  ? "w-fit max-w-[calc(100dvw-320px)]"
                  : "w-fit max-w-[calc(100dvw-570px)]"
              }`
        } 
               flex  hidden-show-scrollBar transition-all duration-200  justify-between gap-2  `}
      >
        <div
          className="flex items-center h-[2.1rem]  !min-w-[220px]
          font-medium text-main-black text-sm text-center justify-center"
        >
          {t("yearPlan.totalSum")}
        </div>
        <div className="w-[calc(100%-300px)] summary overflow-auto flex justify-between gap-4 hidden-show-scrollbar items-center">
          {columnSums.map((month) => (
            <div
              key={month?.key}
              className="text-sm text-right min-w-[120px] text-main-black"
            >
              {month?.value ?? 0}
            </div>
          ))}
        </div>

        <div
          className="flex items-center h-[2.1rem]  !min-w-[154px] 
              font-medium text-main-black text-sm text-center justify-center "
        ></div>
      </div>
    </div>
  );
}
