"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

import { useERPTableHost } from './ERPTableHost';

/** Latest `onToast` without making callers' callbacks/effects depend on its identity. */
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Remote request failed';
}

type UseRemoteQueryArgs = {
  url?: string;
  body?: Record<string, unknown>;
  skip?: boolean;
  noCache?: boolean;
};

export function useRemoteQuery<T = unknown>(args: UseRemoteQueryArgs) {
  const { remoteApi, onToast } = useERPTableHost();
  const toastRef = useLatest(onToast);
  const [data, setData] = useState<{ Data?: T; TotalCount?: number; ReturnCount?: number; Result?: string } | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const refetch = useCallback(async () => {
    if (!args.url || args.skip || !remoteApi) {
      setData(null);
      return;
    }
    setIsFetching(true);
    setError(null);
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
    } catch (e) {
      // Never let a backend failure escape from an effect as an unhandled rejection.
      setData(null);
      setError(e);
      toastRef.current?.('error', errorMessage(e), e);
    } finally {
      setIsFetching(false);
    }
  }, [args.url, args.skip, args.noCache, JSON.stringify(args.body ?? {}), remoteApi]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, isFetching, error, refetch };
}

/**
 * Imperative counterpart of {@link useRemoteQuery} (RTK `useGet…Mutation`
 * style): nothing is fetched until `trigger` is called, and body/url changes
 * never refetch on their own.
 */
export function useLazyRemote<T = unknown>() {
  const { remoteApi, onToast } = useERPTableHost();
  const toastRef = useLatest(onToast);
  const [data, setData] = useState<{ Data?: T; TotalCount?: number; ReturnCount?: number; Result?: string } | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const trigger = useCallback(
    async (args: { url?: string; body?: Record<string, unknown> }) => {
      if (!args.url || !remoteApi) {
        setData(null);
        return;
      }
      setIsFetching(true);
      setError(null);
      try {
        const response = await remoteApi.request<{
          Data?: T;
          TotalCount?: number;
          ReturnCount?: number;
          Result?: string;
        }>({ endpoint: args.url, params: args.body, method: 'POST' });
        setData(response ?? null);
      } catch (e) {
        // Resolves (never rejects): failures surface via `error` and `onToast`.
        setData(null);
        setError(e);
        toastRef.current?.('error', errorMessage(e), e);
      } finally {
        setIsFetching(false);
      }
    },
    [remoteApi],
  );

  return [trigger, { data, isFetching, error }] as const;
}
