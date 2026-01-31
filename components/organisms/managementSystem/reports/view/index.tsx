"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { CustomButton, CustomSpin } from "@components/atoms/defaultElements";
import {
  DashboardView,
  View,
} from "@components/molecules/managementSystem/reports";
import { ReportTypeEnum } from "@services/mng/report/type";

import type { IProps } from "./type";

export const ReportView = ({
  reportData,
  dataSources,
  data,
  isFetching,
  refetch,
}: IProps) => {
  const t = useTranslations();

  const type = data?.Type === ReportTypeEnum.Dashboard ? "dashboard" : "report";

  const [reportTemplate, setReportTemplate] = useState(null);

  useEffect(() => {
    if (data) {
      const fileUrl = data?.ReturnFileUrl;
      fileUrl && setReportTemplate(fileUrl);
    }
  }, [data]);
  return (
    <>
      {reportTemplate ? (
        type === "dashboard" ? (
          <DashboardView
            template={reportTemplate}
            dataSources={dataSources}
            data={reportData}
          />
        ) : (
          <View
            template={reportTemplate}
            dataSources={dataSources}
            data={reportData}
          />
        )
      ) : (
        <div className="flex flex-col justify-center items-center gap-4 h-full">
          {isFetching ? (
            <CustomSpin className="w-full" size="large" />
          ) : (
            <>
              <p>{t("report.error")}</p>
              <div className="flex gap-2">
                <CustomButton
                  onClick={() => refetch()}
                  className="flex items-center bg-gray-gray3 hover:!bg-gray-gray5 dark:bg-gray-gray10 !border-none rounded h-[36px] hover:!text-main-black text-xs"
                >
                  {t("general.tryAgain")}
                </CustomButton>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
