export interface IProps {
  id: number | null;
  onClose: () => void;
}

export interface IDataConnection {
  TafsilyTypes: {
    TafsilyTypeId: number;
    IsSelected: boolean;
    TafsilyDesc: string;
  }[];

  Level: number;
}
