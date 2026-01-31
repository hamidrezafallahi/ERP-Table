import { ReactNode } from "react";

import type { ButtonProps, MenuProps } from "antd";
import type { ItemType } from "antd/es/menu/interface";
import type { DropdownProps } from "antd/lib";

export interface IProps extends DropdownProps {
  type?: "link" | "text" | "primary" | "default" | "dashed" | undefined;
  text?: string;
  items?: ItemType[];
  className?: string;
  icon?: ReactNode;
  placement?:
    | "bottomLeft"
    | "bottom"
    | "bottomRight"
    | "topLeft"
    | "top"
    | "topRight";
  arrow?: boolean;
  more?: boolean;
  trigger?: ["hover" | "click"];
  loading?: boolean;
  danger?: boolean;
  onClick?: MenuProps["onClick"];
  size?: ButtonProps["size"];
  style?: ButtonProps["style"];
  children?: ReactNode;
  menu?: MenuProps;
  onButtonClick?: (event) => void;
  dropdownRender?: (menu: ReactNode) => ReactNode;
  dropdownClassName?: string;
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}
