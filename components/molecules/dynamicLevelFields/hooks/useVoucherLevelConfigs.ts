import { useMemo } from 'react';

import { IRequestConfig } from '@type/elementType';

import { voucherTypeToLevel4Type } from '../conternt';
import { Level4TypeEnum } from '../enum';

const getLevel4Config = (
  accountId: number,
  level4Type?: Level4TypeEnum,
): IRequestConfig => {
   return {
    addWebUrl: "/api/trh/select/tafsili4selectoption",
    endpoint: "/api/trh/select/tafsili4selectoption",
    TafsiliTypeId: level4Type,
  };
};

export function useVoucherLevelConfigs(
  accountId: number | null,
  level4Type?: Level4TypeEnum,
  voucherTypeId?: number,
) {
  return useMemo(() => {
    if (!accountId) return {} as any;
    const resolvedLevel4Type =
      voucherTypeToLevel4Type[voucherTypeId!] ?? level4Type;

    const level4 = getLevel4Config(accountId, resolvedLevel4Type);

    const otherLevels = Object.fromEntries(
      Array.from({ length: 9 }, (_, i) => {
        const level = i + 5;
        const config: IRequestConfig = {
          addWebUrl: `/api/acc/select/tafsiliLevel${level}`,
          endpoint: `/api/acc/select/tafsiliLevel${level}`,
          AccountId: accountId,
        };
        return [`level${level}Config`, config];
      }),
    );

    return {
      level4Config: level4,
      ...otherLevels,
    };
  }, [accountId, level4Type,voucherTypeId]);
}
