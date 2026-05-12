import { ReactNode } from "react";

export type ActionsMobileType = {
  key: string;
  title:string
  icon: ReactNode;
  onClick: () => void;
  disabled:boolean
}[];
