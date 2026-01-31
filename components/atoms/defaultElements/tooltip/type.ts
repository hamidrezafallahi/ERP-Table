import { ReactNode } from 'react';

import type { TooltipProps } from 'antd';

type IChildren = {
  children: ReactNode;
};

export type IProps = IChildren & TooltipProps;
