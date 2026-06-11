"use client";
import {
  useEffect,
  useRef,
} from 'react';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { shallowEqual } from 'react-redux';

// ✅ Import Dashboard Designer instead of Report Designer
import {
  CustomButton,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import ExpandedButton from '@components/molecules/expandedButton';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useInitializePage } from '@hooks/custom/useInitializePage';
import { useCUDFormDataMutation } from '@services/base';
import { SystemEnum } from '@type/enum';
import {
  showErrorToast,
  showSuccessToast,
} from '@utils/toast';

export const DashboardDesigner = ({ dashboardTemplate }) => {
  const StiLicKey =
    "6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHkO46nMQvol4ASeg91in+mGJLnn2KMIpg3eSXQSgaFOm15+0l" +
    "hekKip+wRGMwXsKpHAkTvorOFqnpF9rchcYoxHXtjNDLiDHZGTIWq6D/2q4k/eiJm9fV6FdaJIUbWGS3whFWRLPHWC" +
    "BsWnalqTdZlP9knjaWclfjmUKf2Ksc5btMD6pmR7ZHQfHXfdgYK7tLR1rqtxYxBzOPq3LIBvd3spkQhKb07LTZQoyQ" +
    "3vmRSMALmJSS6ovIS59XPS+oSm8wgvuRFqE1im111GROa7Ww3tNJTA45lkbXX+SocdwXvEZyaaq61Uc1dBg+4uFRxv" +
    "yRWvX5WDmJz1X0VLIbHpcIjdEDJUvVAN7Z+FW5xKsV5ySPs8aegsY9ndn4DmoZ1kWvzUaz+E1mxMbOd3tyaNnmVhPZ" +
    "eIBILmKJGN0BwnnI5fu6JHMM/9QR2tMO1Z4pIwae4P92gKBrt0MqhvnU1Q6kIaPPuG2XBIvAWykVeH2a9EP6064e11" +
    "PFCBX4gEpJ3XFD0peE5+ddZh+h495qUc1H2B";

  const addFileUrl = "api/report/insert/reports/file";
  const dashboardListConfig = {
    repoId: 10001,
    systemId: SystemEnum.report,
    url: "report/reportList",
  };

  const t = useTranslations();
  const initializePage = useInitializePage();
  const params = useSearchParams();
  const id = Number(params.get("id"));
  const { fullScreen, dashboardListPageId } = useAppSelector((state) => {
    const fullScreen = state.withPersist.config.fullScreen;

    const dashboardListPageId = state.withPersist.pages?.find(
      (page) => page.url === dashboardListConfig.url
    )?.pageId;

    return {
      fullScreen,
      dashboardListPageId,
    };
  }, shallowEqual);

  const [saveDashboard] = useCUDFormDataMutation();

  const designerRef = useRef<any>(null);

  const handleBackToList = () => {
    initializePage({
      config: {
        RepoId: dashboardListConfig.repoId,
        SystemId: dashboardListConfig.systemId,
        url: dashboardListConfig.url,
        pageId: dashboardListPageId,
      },
    });
  };

  useEffect(() => {
    const loadDesigner = async () => {
      try {
         const { Stimulsoft } =
          await import("stimulsoft-reports-js/Scripts/stimulsoft.designer");
        //Activation with using license code
        Stimulsoft.Base.StiLicense.Key = StiLicKey;

        const options = new Stimulsoft.Designer.StiDesignerOptions();
        options.appearance.theme = 36;

        // ✅ Dashboard Designer
        const designer = new Stimulsoft.Designer.StiDesigner(
          options,
          "StiDashboardDesigner",
          false
        );

        designer.onSaveReport = async (e: any) => {
          const dashboardJson: string = designer.report.saveToJsonString();

          const blob = new Blob([dashboardJson], {
            type: "application/json",
          });

          const formData = new FormData();
          //   formData.append("File", blob, "dashboard.mdc"); // ✅ .mdc extension
          formData.append("File", blob, "dashboard.mrt");
          formData.append("ReportId", id.toString());
          try {
            const saveResult = await saveDashboard({
              url: addFileUrl,
              body: formData,
            }).unwrap();
            if (saveResult?.Result === "Success") {
              showSuccessToast(t("toast.successTitle"));
            }
          } catch (err) {
            null;
          }
          handleBackToList();
        };

        // ✅ Dashboard instead of Report
        const dashboard = new Stimulsoft.Report.StiReport();

        if (dashboardTemplate) {
          dashboard.loadFile(dashboardTemplate);
        }

        designer.report = dashboard;
        designer.renderHtml("designer");
        designerRef.current = designer;
      } catch (error) {
        showErrorToast(`${t("general.uploadError")} Stimulsoft:`, error);
      }
    };

    loadDesigner();
  }, [saveDashboard, dashboardTemplate]);

  return (
    <div className={`lg:relative h-full w-full`}>
      <div
        className={`lg:absolute lg:-top-[60px] lg:rtl:-left-[10px] -right-[10px] `}
      >
        <div className="flex justify-end items-center gap-2">
          <CustomTooltip title={t("general.fullScreenMode")}>
            <ExpandedButton />
          </CustomTooltip>
          <CustomButton
            onClick={handleBackToList}
            className="flex items-center bg-gray-gray3 hover:!bg-gray-gray5 dark:bg-gray-gray10 !border-none rounded h-[36px] hover:!text-main-black text-xs"
          >
            {t("general.return")}
          </CustomButton>
        </div>
      </div>

      <div
        className={`w-full ${
          fullScreen ? "h-[calc(100dvh-100px)]" : "h-[calc(100dvh-160px)]"
        }  overflow-y-auto`}
        dir="ltr"
        id="designer"
      />
    </div>
  );
};
