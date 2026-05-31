export interface IViewer {
    
    rules?: IViewerRule[];
    
}

export interface IManualReport {
    reportBtnName?: string;
    reportTitle?: string;
   
   
    rules?: IViewerRule[];
}

export interface IReportFile {
    dataSourceName?: string;
    fileUrl?: string;
    
}

export interface IViewerRule {
    condition?: (viewData: any) => boolean;

    apiUrl?: string;

    reportFile?: IReportFile;
}