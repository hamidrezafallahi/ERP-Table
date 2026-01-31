import React from 'react';

import type {
  DropdownProps,
  MenuProps,
} from 'antd';
import { Dropdown } from 'antd';

type Props = {
  children: React.ReactNode;
  items?: MenuProps["items"];
  className?: string;
  placement?: DropdownProps["placement"];
  trigger?: DropdownProps["trigger"];
};

const CustomDropdownButton: React.FC<Props> = ({
  children,
  items,
  className,
  placement = "bottomRight",
  trigger = ["click"],
}) => {
  const triggerNode = <span className={className}>{children}</span>;

  if (!items || items.length === 0) {
    return triggerNode;
  }

  return (
    <Dropdown menu={{ items }} placement={placement} trigger={trigger}>
      {triggerNode}
    </Dropdown>
  );
};

export default CustomDropdownButton;
