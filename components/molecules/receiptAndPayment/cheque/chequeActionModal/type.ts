import { ReactNode } from "react";

export interface IProps {
  ids?: number[];
  handleReturn?: () => void;
  children: ReactNode;
}
