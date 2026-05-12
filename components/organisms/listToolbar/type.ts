import { ReactNode } from "react";

export interface ModalCofigProps {
  key: string;
  isOpen: boolean;
  onClose: () => void;
  headerName?: string;
  headerIcon?: ReactNode;
  content: ReactNode;
  contentClassName?: string;
  withFullscreen?: boolean;
}
export type ActiveModal =
    | "addTag"
    | "documentMerge"
    | "report"
    | "print"
    | "remindMe"
    | null;