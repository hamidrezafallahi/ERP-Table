import { ReactNode } from 'react';

import { AbstractIntlMessages } from 'next-intl';

import type { TLang } from '@slice/config/type';

export interface IProps {
  children: ReactNode;
  local: TLang;
  messages: AbstractIntlMessages;
}
