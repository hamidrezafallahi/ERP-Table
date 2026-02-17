import { Dispatch, SetStateAction } from "react";

import { UploadProps } from "antd";

export interface IProps extends UploadProps {
  minimize?: boolean;
  setMinimize?: Dispatch<SetStateAction<boolean>>;
}
