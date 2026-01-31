export interface IProps {
  active?:boolean  
  data: any;
  isLoading: boolean;
  PageRecordCount: number;
  PageNumber: number;
  childIsLoading?: boolean;
  handleRowClick?:(e:any)=>void
}
