import { FormInstance } from "antd";

export interface IProps {
  form: FormInstance<any>;
  mutateIsLoading: boolean;
  onClear: () => void;
  bankAccounts: {
    id: number | null;
    desc: string | null;
    showSingle: boolean;
  };
  formValues: Record<string, any>;
}
