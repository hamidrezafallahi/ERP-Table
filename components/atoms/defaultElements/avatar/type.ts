import { ReactNode } from "react";

export interface IProps {
  icon?: ReactNode;
  shape?: "circle" | "square";
  size?: number | "large" | "small" | "default";
  gap?: number;
  src?: string | ReactNode;
  className?: string;
}
