"use client";

import {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomSpin,
} from '@components/atoms/defaultElements';
import {
  DashboardDesigner,
  ReportDesigner,
} from '@components/organisms/managementSystem';
import { useInitializePage } from '@hooks/custom';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import { ReportTypeEnum } from '@services/mng/report/type';
import type {
  IReportFile,
  IRequest,
} from '@services/reportFile/type';
import { setPageType } from '@slice/pages';
import { PageTypeEnum } from '@type/enum';

export default function DesignerPage() {
  const dispatch = useDispatch();
  const t = useTranslations();
  const initializePage = useInitializePage();
  const params = useSearchParams();
  const id = Number(params.get("id"));

  const type =
    Number(params.get("type")) === ReportTypeEnum.Report
      ? "report"
      : "dashboard";

  const { activePage } = useAppSelector((state) => {
    const activePage = state.withPersist.pages?.find((page) => page.isActive);

    return {
      activePage,
    };
  }, shallowEqual);

  const handleBackToList = () => {
    initializePage({
      config: {
        RepoId: activePage.RepoId,
        SystemId: activePage.SystemId,
        url: activePage.url,
        pageId: activePage.pageId,
      },
    });
  };

  const [template, setTemplate] = useState(null);

  const { data, isFetching, refetch } = useGetData<IReportFile[], IRequest>({
    url: "api/report/select/reports/file",
    body: {
      ReportId: id,
      RepoViewId: 120001,
    },
  });

  useEffect(() => {
    dispatch(setPageType(PageTypeEnum.Report));
    return () => {
      dispatch(setPageType(PageTypeEnum.List));
    };
  }, []);

  useEffect(() => {
    if (data?.Data) {
      const fileUrl = data?.Data?.[0]?.ReturnFileUrl;
      fileUrl && setTemplate(fileUrl);
    }
  }, [data?.Data]);
  return (
    <>
      {template ? (
        type === "dashboard" ? (
          <DashboardDesigner dashboardTemplate={template} />
        ) : (
          <ReportDesigner reportTemplate={template} />
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
                  onClick={handleBackToList}
                  className="flex items-center bg-gray-gray3 hover:!bg-gray-gray5 dark:bg-gray-gray10 !border-none rounded h-[36px] hover:!text-main-black text-xs"
                >
                  {t("general.return")}
                </CustomButton>
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
}
