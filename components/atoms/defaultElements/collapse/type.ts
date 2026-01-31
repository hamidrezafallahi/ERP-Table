import { ReactNode } from "react";

import { CollapseProps } from "antd";
import type { ItemType } from "antd/es/menu/interface";

export interface IProps {
  className: string;
  children: ReactNode;
  accordion: boolean;
  activeKey: string[] | string | number[] | number;
  bordered: boolean;
  collapsible: "header" | "icon" | "disabled";
  defaultActiveKey: string[] | string | number[] | number;
  destroyInactivePanel: boolean;
  expandIcon: CollapseProps;
  expandIconPosition: "top" | "Bottom";
  ghost: boolean;
  size: "large" | "middle" | "small";
  onChange: () => void;
  items: ItemType;
}
