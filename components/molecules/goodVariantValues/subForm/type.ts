import { Dispatch, SetStateAction } from "react";

import { FormInstance } from "antd";

export interface IProps {
  getUrl: string;
  repoViewId: number;
  sourceKey: string | number;
  sourceId: number;
  fieldKey: string;
  fieldId: number;
  variantId: number;
  title: string;
  form: FormInstance<any>;
  setDetailIsLoading: Dispatch<SetStateAction<boolean>>;
}
