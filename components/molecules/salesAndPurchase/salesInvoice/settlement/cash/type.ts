import { FormInstance } from "antd";

export interface IProps {
  form: FormInstance<any>;
  mutateIsLoading: boolean;
  onClear: () => void;
  formValues: Record<string, any>;
  scrollHeight?:number
}
