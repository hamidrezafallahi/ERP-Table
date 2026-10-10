"use client";

import { useCallback, useEffect, useState } from 'react';

import { useERPTableHost } from './ERPTableHost';

type UseRemoteQueryArgs = {
  url?: string;
  body?: Record<string, unknown>;
  skip?: boolean;
  noCache?: boolean;
};

export function useRemoteQuery<T = unknown>(args: UseRemoteQueryArgs) {
  const { remoteApi } = useERPTableHost();
  const [data, setData] = useState<{ Data?: T; TotalCount?: number; ReturnCount?: number; Result?: string } | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const refetch = useCallback(async () => {
    if (!args.url || args.skip || !remoteApi) {
      setData(null);
      return;
    }
    setIsFetching(true);
    try {
      const response = await remoteApi.request<{
        Data?: T;
        TotalCount?: number;
        ReturnCount?: number;
        Result?: string;
      }>({
        endpoint: args.url,
        params: args.body,
        method: 'POST',
      });
      setData(response ?? null);
    } finally {
      setIsFetching(false);
    }
  }, [args.url, args.skip, args.noCache, JSON.stringify(args.body ?? {}), remoteApi]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, isFetching, refetch };
}

/**
 * Imperative counterpart of {@link useRemoteQuery} (RTK `useGet…Mutation`
 * style): nothing is fetched until `trigger` is called, and body/url changes
 * never refetch on their own.
 */
export function useLazyRemote<T = unknown>() {
  const { remoteApi } = useERPTableHost();
  const [data, setData] = useState<{ Data?: T; TotalCount?: number; ReturnCount?: number; Result?: string } | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  const trigger = useCallback(
    async (args: { url?: string; body?: Record<string, unknown> }) => {
      if (!args.url || !remoteApi) {
        setData(null);
        return;
      }
      setIsFetching(true);
      try {
        const response = await remoteApi.request<{
          Data?: T;
          TotalCount?: number;
          ReturnCount?: number;
          Result?: string;
        }>({ endpoint: args.url, params: args.body, method: 'POST' });
        setData(response ?? null);
      } finally {
        setIsFetching(false);
      }
    },
    [remoteApi],
  );

  return [trigger, { data, isFetching }] as const;
}
