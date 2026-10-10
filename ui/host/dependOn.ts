"use client";

import { useERPTableHost } from './ERPTableHost';

/** One dependency: a named sibling field and (optionally) its current value. */
export type DependOnItem =
  | string
  | { fieldName: string; value?: unknown };
export type DependOn = DependOnItem | DependOnItem[];

export type DependValueResolver = (item: DependOnItem) => unknown;

export type UseDependOnOptions = {
  /**
   * Ask the host to resolve dependency values (e.g. from the form that owns
   * the grid). When false/omitted, the `value` carried by each item is used.
   */
  enabled?: boolean;
  /** Send `value.value` when a resolved value is an option-like object. */
  unwrapObjectValue?: boolean;
};

export type UseDependOnResult = {
  /** `{ [fieldName]: value }` to merge into a remote request body. */
  dependencyBody: Record<string, unknown>;
  /** Every dependency has a value (true when there is no dependOn). */
  isReady: boolean;
  /** Stable string that changes when the dependencies change. */
  dependencyKey: string;
};

/**
 * Host-injectable dependency resolver. The arianERP host implements this on
 * top of Redux page data; the default implementation reads the static values
 * carried by the `dependOn` items.
 */
export type UseDependOnHook = (
  dependOn?: DependOn | null,
  options?: UseDependOnOptions,
) => UseDependOnResult;

const toList = (dependOn?: DependOn | null): DependOnItem[] =>
  !dependOn ? [] : Array.isArray(dependOn) ? dependOn : [dependOn];

export const getDependFieldName = (item: DependOnItem): string =>
  typeof item === 'string' ? item : item.fieldName;

/** The value carried by the item itself; a bare field name carries none. */
export const getStaticDependValue: DependValueResolver = (item) =>
  typeof item === 'object' ? item.value : undefined;

/** True when every dependency resolves to a non-null value (or there are none). */
export const hasDependValue = (
  dependOn?: DependOn | null,
  resolve: DependValueResolver = getStaticDependValue,
): boolean => toList(dependOn).every((item) => resolve(item) != null);

/** Builds the `{ [fieldName]: value }` part of a request body. */
export const buildDependencyBody = (
  dependOn?: DependOn | null,
  resolve: DependValueResolver = getStaticDependValue,
): Record<string, unknown> =>
  Object.fromEntries(
    toList(dependOn).map((item) => [getDependFieldName(item), resolve(item)]),
  );

/** Default `UseDependOnHook`: static values carried by the items. */
export const useStaticDependOn: UseDependOnHook = (dependOn) => ({
  isReady: hasDependValue(dependOn),
  dependencyBody: buildDependencyBody(dependOn),
  dependencyKey: JSON.stringify(dependOn ?? null),
});

/** Resolve dependency values through the host hook, falling back to static. */
export const useHostDependOn: UseDependOnHook = (dependOn, options) => {
  const host = useERPTableHost();
  const hook = host.useDependOn ?? useStaticDependOn;
  return hook(dependOn, options);
};
