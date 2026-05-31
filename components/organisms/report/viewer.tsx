"use client";

import {
  useEffect,
  useRef,
} from 'react';

import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';

import { useCUDDataMutation } from '../../../services/base';
import { IViewer } from './type';

export const Viewer = ({ rules }: IViewer) => {
  const { viewData, modalIsFullScreen } = useAppSelector(
    (state) => ({
      viewData: state.withPersist.pages?.find(
        (item) => item.isActive
      )?.viewData,
      modalIsFullScreen:
        state.withPersist.config.modalIsFullscreen,
    }),
    shallowEqual
  );

  const viewerRef = useRef<HTMLDivElement | null>(null);

  const viewer = useRef<any>(null);
  const report = useRef<any>(null);

  const [mutateItem] = useCUDDataMutation();

  const StiLicKey =
    "6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHkO46nMQvol4ASeg91in+mGJLnn2KMIpg3eSXQSgaFOm15+0l" +
    "hekKip+wRGMwXsKpHAkTvorOFqnpF9rchcYoxHXtjNDLiDHZGTIWq6D/2q4k/eiJm9fV6FdaJIUbWGS3whFWRLPHWC" +
    "BsWnalqTdZlP9knjaWclfjmUKf2Ksc5btMD6pmR7ZHQfHXfdgYK7tLR1rqtxYxBzOPq3LIBvd3spkQhKb07LTZQoyQ" +
    "3vmRSMALmJSS6ovIS59XPS+oSm8wgvuRFqE1im111GROa7Ww3tNJTA45lkbXX+SocdwXvEZyaaq61Uc1dBg+4uFRxv" +
    "yRWvX5WDmJz1X0VLIbHpcIjdEDJUvVAN7Z+FW5xKsV5ySPs8aegsY9ndn4DmoZ1kWvzUaz+E1mxMbOd3tyaNnmVhPZ" +
    "eIBILmKJGN0BwnnI5fu6JHMM/9QR2tMO1Z4pIwae4P92gKBrt0MqhvnU1Q6kIaPPuG2XBIvAWykVeH2a9EP6064e11" +
    "PFCBX4gEpJ3XFD0peE5+ddZh+h495qUc1H2B";

  useEffect(() => {
    const loadReport = async () => {
      if (!viewData || !rules) return;

      const matchedRule = rules.find(
        (x) => x.condition?.(viewData)
      );

      if (!matchedRule) return;

      try {
        const { Stimulsoft } = await import(
          "stimulsoft-reports-js/Scripts/stimulsoft.viewer"
        );

        Stimulsoft.Base.StiLicense.Key = StiLicKey;

        const options =
          new Stimulsoft.Viewer.StiViewerOptions();

        viewer.current =
          new Stimulsoft.Viewer.StiViewer(
            options,
            "StiViewer",
            false
          );

        report.current =
          new Stimulsoft.Report.StiReport();

        const res = await mutateItem({
          url: matchedRule.apiUrl,
          body: viewData,
        }).unwrap();

        report.current.loadFile(
          matchedRule.reportFile.fileUrl
        );

        const ds = new Stimulsoft.System.Data.DataSet(
          matchedRule.reportFile.dataSourceName
        );

        ds.readJson(res.Data);

        report.current.regData(
          matchedRule.reportFile.dataSourceName,
          "",
          ds
        );

        report.current.renderAsync(() => {
          viewer.current.report = report.current;

          if (viewerRef.current) {
            viewer.current.renderHtml(
              viewerRef.current.id
            );
          }
        });
      } catch (error) {
        console.error(
          "Report load error:",
          error
        );
      }
    };

    loadReport();
  }, [viewData, rules, mutateItem]);

  const containerStyle = {
    width: "100%",
    height: 1200,
    overflow: "auto" as const,
  };

  return (
    <div
      className={`${
        modalIsFullScreen
          ? "h-[calc(100dvh-80px)]"
          : "h-[calc(100dvh-200px)]"
      } relative w-full overflow-auto`}
    >
      <div
        id="viewer-container1"
        ref={viewerRef}
        style={containerStyle}
      />
    </div>
  );
};