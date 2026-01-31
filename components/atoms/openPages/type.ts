export interface IProps {
  pageData: {
    pageName: string;
    caption: string;
    pageId: string;
    pageState?: string;
    runFirstTime?: boolean;
  };
}
