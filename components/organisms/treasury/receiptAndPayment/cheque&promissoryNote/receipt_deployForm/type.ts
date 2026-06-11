import { FormInstance } from "antd";

export interface IProps {
  onSubmitCallback: (values: unknown) => void;
  form: FormInstance;
  type?: number;
}

export interface RequestConfigs {
  addWebUrl: string;
  endpoint: string;
  repoViewId: number;
}

