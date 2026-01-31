import './dashboardStyle.css';

import {
  useEffect,
  useRef,
} from 'react';

import { Stimulsoft } from 'stimulsoft-dashboards-js/Scripts/stimulsoft.viewer';

const DashboardView = () => {
  const viewerRef = useRef(null);
  const viewer = useRef(
    new Stimulsoft.Viewer.StiViewer(undefined, "StiViewer", false)
  );
  const report = useRef(Stimulsoft.Report.StiReport.createNewDashboard());

  useEffect(() => {
    const loadDashboard = async () => {
      console.log("Loading Viewer view");
      console.log(process);
      const dashboardUrl = process.env.APP_URL
        ? `${process.env.APP_URL}/reports/DashboardChristmas.mrt`
        : "/reports/DashboardChristmas.mrt";

      // Load the dashboard file
      report.current.loadFile(dashboardUrl);
      viewer.current.report = report.current;

      console.log("Rendering the viewer to selected element");
      viewer.current.renderHtml(viewerRef.current.id);
    };

    loadDashboard();
  }, []); // Empty dependency array to run once on mount

  return <div id="viewer" ref={viewerRef} className="App"></div>;
};

export default DashboardView;
