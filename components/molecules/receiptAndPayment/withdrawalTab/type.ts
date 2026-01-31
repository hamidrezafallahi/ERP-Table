import type { Dispatch, SetStateAction } from "react";

import type { IActiveTab } from "../type";

export interface IProps {
  active: IActiveTab;
  setActive: Dispatch<SetStateAction<IActiveTab>>;
}
