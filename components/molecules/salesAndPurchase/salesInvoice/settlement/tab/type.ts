import type { Dispatch, SetStateAction } from "react";

export interface IProps {
  active: IActiveTab;
  setActive: Dispatch<SetStateAction<IActiveTab>>;
}

export interface IActiveTab {
  key: string;
  value: number;
  fieldKey: string;
}
