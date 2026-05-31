"use client";

import {
  useEffect,
  useRef,
} from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { showErrorToast } from '@utils/toast';

import type { IProps } from './type';

export const DashboardView = ({ template, data, dataSources }: IProps) => {
  const t = useTranslations();
  const { modalIsFullScreen } = useAppSelector(
    (state) => ({
      modalIsFullScreen: state.withPersist.config.modalIsFullscreen,
    }),
    shallowEqual,
  );

  const viewerRef = useRef<HTMLDivElement | null>(null);
  const viewer = useRef<any>(null);
  const report = useRef<any>(null);

  const StiLicKey =
    "6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHkO46nMQvol4ASeg91in+mGJLnn2KMIpg3eSXQSgaFOm15+0l" +
    "hekKip+wRGMwXsKpHAkTvorOFqnpF9rchcYoxHXtjNDLiDHZGTIWq6D/2q4k/eiJm9fV6FdaJIUbWGS3whFWRLPHWC" +
    "BsWnalqTdZlP9knjaWclfjmUKf2Ksc5btMD6pmR7ZHQfHXfdgYK7tLR1rqtxYxBzOPq3LIBvd3spkQhKb07LTZQoyQ" +
    "3vmRSMALmJSS6ovIS59XPS+oSm8wgvuRFqE1im111GROa7Ww3tNJTA45lkbXX+SocdwXvEZyaaq61Uc1dBg+4uFRxv" +
    "yRWvX5WDmJz1X0VLIbHpcIjdEDJUvVAN7Z+FW5xKsV5ySPs8aegsY9ndn4DmoZ1kWvzUaz+E1mxMbOd3tyaNnmVhPZ" +
    "eIBILmKJGN0BwnnI5fu6JHMM/9QR2tMO1Z4pIwae4P92gKBrt0MqhvnU1Q6kIaPPuG2XBIvAWykVeH2a9EP6064e11" +
    "PFCBX4gEpJ3XFD0peE5+ddZh+h495qUc1H2B";

  useEffect(() => {
    const bindData = (
      reportInstance: any,
      sources: any[],
      data: IProps["data"],
      Stimulsoft: any,
    ) => {
      sources?.forEach(({ DataSourceName }) => {
        const name = Array.isArray(DataSourceName)
          ? DataSourceName[0]
          : (DataSourceName ?? "DataSource");

        const correctData = data?.find(
          (item) => item.dataSourceName === DataSourceName,
        )?.data;
        const wrapped = {
          [name]: Array.isArray(correctData) ? correctData : [correctData],
        };
        const ds = new Stimulsoft.System.Data.DataSet(name);
        ds.readJson(wrapped);
        reportInstance.regData(name, "", ds);
      });
      reportInstance.dictionary.synchronize();
    };

    const loadReport = async () => {
      try {
        const { Stimulsoft } =
          await import("stimulsoft-reports-js/Scripts/stimulsoft.designer");
        Stimulsoft.Base.StiLicense.Key = StiLicKey;

        if (!template || !data) {
          showErrorToast(t("general.notFoundData"));
          return;
        }
        const options = new Stimulsoft.Viewer.StiViewerOptions();

        viewer.current = new Stimulsoft.Viewer.StiViewer(
          options,
          "StiViewer",
          false,
        );

        report.current = new Stimulsoft.Report.StiReport();

        report.current.loadFile(template);
        bindData(report.current, dataSources, data, Stimulsoft);

        report.current.renderAsync(() => {
          viewer.current.report = report.current;
          if (viewerRef.current) {
            viewer.current.renderHtml(viewerRef.current.id);
            (viewer.current as any).rendered = true;
          }
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        showErrorToast(`${t("general.uploadError")}: ${message}`);
      }
    };

    loadReport();
  }, [template, data, dataSources]);

  const containerStyle = {
    width: "100%",
    height: 1200,
    overflow: "auto" as const,
  };

  return (
    <div
      className={`${
        modalIsFullScreen ? "h-[calc(100dvh-80px)]" : "h-[300px]"
      } relative w-full overflow-auto`}
    >
      <div id="viewer-container" ref={viewerRef} style={containerStyle} />
    </div>
  );
};
