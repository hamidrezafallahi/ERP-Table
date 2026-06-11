import { Dispatch, ReactNode, SetStateAction } from "react";

export interface IProps {
  ids?: number[];
  handleReturn?: () => void;
  children: ReactNode;
  selectedDetails?: any[];
  setSelectedDetails?: Dispatch<SetStateAction<[]>>;
  setSelectedItems?: Dispatch<SetStateAction<number[]>>;
}
