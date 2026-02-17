import { ReactNode } from 'react';

import type { TLang } from '@slice/config/type';

export interface IProps {
  children: ReactNode;
  local: TLang;
}
