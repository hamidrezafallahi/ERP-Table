import { ReactNode } from "react";

import { SpinIndicator } from "antd/es/spin";

export interface IProps {
  size?: "small" | "default" | "large";
  children?: ReactNode;
  indicator?: SpinIndicator | undefined;
  tip?: ReactNode;
  fullscreen?: boolean;
  percent?: number | "auto";
  spinning?: boolean;
  delay?: number;
  className?: string;
}
