"use client";
import { useEffect, useState } from "react";

import { IAccount } from "@services/acc/account/type";
import { useGetData } from "@services/base";
import { IRequest } from "@services/reportFile/type";

import { ICondition } from "../types";

interface useAccountConditionProps {
  accountId: number | null;
  url: string;
}

export const useAccountCondition = (props: useAccountConditionProps) => {
  const { accountId, url = "/api/acc/select/account" } = props;
  const [condition, setCondition] = useState<ICondition | null>(null);

  const { data: accountData, isFetching: isLoading } = useGetData<
    IAccount[],
    IRequest
  >({
    url: url,
    body: {
      RepoViewId: 10001,
      Id: accountId,
    },
    skip: !accountId,
  });

  useEffect(() => {
    const exactItem = accountData?.Data && accountData?.Data[0];
    if (exactItem) {
      setCondition({
        HasTafsili: exactItem.HasTafsili,
        HasFifth: exactItem.HasFifth,
        HasSixth: exactItem.HasSixth,
        HasSeventh: exactItem.HasSeventh,
        HasEight: exactItem.HasEight,
        HasNine: exactItem.HasNine,
        HasTen: exactItem.HasTen,
        HasEleven: exactItem.HasEleven,
        HasTwelve: exactItem.HasTwelve,
        HasThirteen: exactItem.HasThirteen,
      });
    } else if (!accountId) {
      setCondition(null);
    }
  }, [accountData?.Data, accountId]);

  return { condition, setCondition, isLoading };
};
