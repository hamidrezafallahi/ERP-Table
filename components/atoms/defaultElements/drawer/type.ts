import { ReactNode } from "react";

export interface IProps {
  isOpen: boolean;
  onClose: () => void;
  content: ReactNode;
  height?: number | string;
}
