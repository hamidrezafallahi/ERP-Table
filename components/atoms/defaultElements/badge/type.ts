import { CSSProperties, ReactNode } from "react";

export interface IProps {
  children?: ReactNode;
  className?: string;
  count?: number;
  overflowCount?: number;
  dot?: boolean;
  offset?: [number, number];
  status?: "success" | "processing" | "default" | "error" | "warning";
  showZero?: boolean;
  color?: string;
  style?: CSSProperties;
  size?: "default" | "small";
  Ribbon?: boolean;
  placement?: "start" | "end";
  text?: ReactNode;
}
