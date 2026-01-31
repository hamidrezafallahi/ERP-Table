export interface IOpenPage {
  pageData: {
    pageName: string;
    caption: string;
    pageId: string;
    pageState?: string;
    runFirstTime?: boolean;
  };
}
