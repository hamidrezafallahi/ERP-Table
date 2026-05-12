import { ReactNode } from "react";

export type ActionsWebType = {
  key: string;
  title:string
  icon: ReactNode;
  onClick: () => void;
}[];
