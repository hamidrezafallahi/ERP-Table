import { FC } from 'react';

import { Drawer } from 'antd';

import type { IProps } from './type';

export const CustomDrawer: FC<IProps> = ({
  isOpen,
  onClose,
  content,
  height,
}) => {
  return (
    <Drawer
      placement="bottom"
      height={height ?? "auto"}
      open={isOpen}
      closable={false}
      onClose={onClose}
    >
      {content}
    </Drawer>
  );
};
