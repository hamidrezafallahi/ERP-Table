"use client";

import './dashboardStyle.css';

import {
  useEffect,
  useRef,
} from 'react';

const DashboardView = () => {
  const viewerRef = useRef<HTMLDivElement | null>(null);

  const viewer = useRef<any>(null);
  const report = useRef<any>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { Stimulsoft } = await import(
          "stimulsoft-reports-js/Scripts/stimulsoft.viewer"
        );

        viewer.current =
          new Stimulsoft.Viewer.StiViewer(
            undefined,
            "StiViewer",
            false
          );

        report.current =
          Stimulsoft.Report.StiReport.createNewDashboard();

        const dashboardUrl = process.env.NEXT_PUBLIC_APP_URL
          ? `${process.env.NEXT_PUBLIC_APP_URL}/reports/DashboardChristmas.mrt`
          : "/reports/DashboardChristmas.mrt";

        report.current.loadFile(dashboardUrl);

        viewer.current.report = report.current;

        if (viewerRef.current) {
          viewer.current.renderHtml(
            viewerRef.current.id
          );
        }
      } catch (error) {
        console.error(
          "Dashboard load error:",
          error
        );
      }
    };

    loadDashboard();
  }, []);

  return (
    <div
      id="viewer"
      ref={viewerRef}
      className="App"
    />
  );
};

export default DashboardView;