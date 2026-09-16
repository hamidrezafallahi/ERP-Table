"use client";

import React, { FC, useEffect, useMemo, useState } from 'react';

import { useRemoteQuery, useTranslations } from '../host';
import { Reload, Select } from '../primitives';
import type { SelectOption as UiSelectOption } from '../primitives/Select';

type DependOn = { fieldName: string; value: unknown };
type RemoteSelectOption = {
  _SelectId: string | number;
  _SelectValue?: string;
  _SelectDisplay?: string;
};
type MappedSelectOption = {
  key: string | number;
  value: string | number;
  label?: string;
  title?: string;
  option: RemoteSelectOption;
};
type DynamicSelectSource = {
  endpoint?: string;
  repoViewId?: string;
  dependOn?: DependOn | DependOn[];
  dependsOn?: DependOn | DependOn[] | string[];
  [key: string]: unknown;
};

export interface ERPTableDynamicSelectProps {
  className?: string;
  value?: unknown;
  onChange?: (value: unknown, option?: unknown) => void;
  dynamicValue?: DynamicSelectSource;
  showId?: boolean;
  infinite?: boolean;
  onSearchPhrase?: (
    correctOptionValue: number,
    correctOptionTitle?: string,
    option?: unknown,
  ) => void;
  showSearch?: boolean;
  onOptionsChange?: (options: MappedSelectOption[]) => void;
  labelValue?: 'selectDisplay' | 'selectValue';
  selectFirstDefault?: boolean;
  displayFormatter?: (option: RemoteSelectOption) => string;
  disabled?: boolean;
  showRefetch?: boolean;
  noCache?: boolean;
  filterOptions?: (option: MappedSelectOption) => boolean;
  filterOption?: (input: string, option: UiSelectOption) => boolean;
  options?: MappedSelectOption[];
  onClear?: () => void;
  onClick?: () => void;
  autoFocus?: boolean;
  popupMatchSelectWidth?: number | boolean;
  popupRender?: (menu: React.ReactNode) => React.ReactNode;
  placeholder?: React.ReactNode;
  allowClear?: boolean;
  onSearch?: (value: string) => void;
}

export const ERPTableDynamicSelect: FC<ERPTableDynamicSelectProps> = ({
  className,
  value,
  onChange,
  dynamicValue,
  infinite = false,
  onSearchPhrase,
  showSearch = true,
  onOptionsChange,
  labelValue = 'selectDisplay',
  selectFirstDefault = false,
  displayFormatter,
  disabled,
  showRefetch,
  noCache = false,
  filterOptions,
  options: externalOptions,
  onClear,
  onClick,
  autoFocus,
  popupMatchSelectWidth,
  popupRender,
  filterOption,
  placeholder,
  allowClear,
  onSearch,
}) => {
  const t = useTranslations();
  const [options, setOptions] = useState<MappedSelectOption[]>([]);
  const [searchPhrase, setSearchPhrase] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const pageRecordCount = 5000;

  const {
    endpoint,
    repoViewId,
    dependOn,
    dependsOn,
    ...bodyRequest
  } = dynamicValue ?? {};

  const getOptionLabel = (option: RemoteSelectOption) => {
    if (displayFormatter) return displayFormatter(option);
    return option._SelectDisplay;
  };

  const asDependOn = (
    value: unknown,
  ): DependOn | DependOn[] | undefined => {
    if (!value || typeof value === 'string') return undefined;
    if (Array.isArray(value)) {
      if (value.length === 0) return [];
      if (typeof value[0] === 'string') return undefined;
      return value as DependOn[];
    }
    if (typeof value === 'object' && value !== null && 'fieldName' in value) {
      return value as DependOn;
    }
    return undefined;
  };

  const hasDependValue = (dependency: DependOn | DependOn[] | undefined) => {
    if (!dependency) return true;
    if (Array.isArray(dependency)) {
      return dependency.every((item) => item.value !== null && item.value !== undefined);
    }
    return dependency.value !== null && dependency.value !== undefined;
  };

  const dependencySource = asDependOn(dependOn ?? dependsOn);
  const dependencyBody = Array.isArray(dependencySource)
    ? Object.fromEntries(dependencySource.map((item: DependOn) => [item.fieldName, item.value]))
    : dependencySource
      ? { [dependencySource.fieldName]: dependencySource.value }
      : {};

  const body = {
    ...bodyRequest,
    ...dependencyBody,
    PagingInfo: infinite
      ? { PageRecordCount: pageRecordCount, PageNumber: pageNumber }
      : null,
    RepoViewId: repoViewId,
  };
  const existBody = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== null),
  );

  const { data, isFetching, refetch } = useRemoteQuery<RemoteSelectOption[]>({
    url: endpoint,
    body: existBody,
    skip: dependencySource ? !hasDependValue(dependencySource) : false,
    noCache,
  });

  const handleRefetch = () => {
    setPageNumber(1);
    if (!(dependencySource && !hasDependValue(dependencySource))) {
      void refetch();
    }
  };

  useEffect(() => {
    if (!data?.Data) return;
    const mapOption = (option: RemoteSelectOption): MappedSelectOption => ({
      key: option._SelectId,
      value: option._SelectId,
      label:
        (labelValue === 'selectValue'
          ? option._SelectValue
          : getOptionLabel(option)) ?? undefined,
      title: getOptionLabel(option),
      option,
    });
    const dynamicOptions = (data.Data ?? []).map(mapOption);
    if (infinite) {
      if (pageNumber === 1) setOptions(dynamicOptions);
      else setOptions((prev) => [...prev, ...dynamicOptions]);
    } else {
      setOptions(dynamicOptions);
    }
  }, [data?.Data, infinite, labelValue, pageNumber, selectFirstDefault]);

  useEffect(() => {
    if (infinite && searchPhrase && searchPhrase.length > 2) setPageNumber(1);
  }, [infinite, searchPhrase]);

  useEffect(() => {
    onOptionsChange?.(options);
    if (selectFirstDefault && options.length) onChange?.(options[0]?.value);
  }, [options, onChange, onOptionsChange, selectFirstDefault]);

  useEffect(() => {
    if (value === null || value === undefined) {
      setSearchPhrase(null);
      setPageNumber(1);
    }
  }, [value]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom =
      e.currentTarget.scrollHeight ===
      e.currentTarget.scrollTop + e.currentTarget.clientHeight;
    if (infinite && bottom && !isFetching) {
      data?.ReturnCount === pageRecordCount && setPageNumber((prev) => prev + 1);
    }
  };

  const filteredOptions = useMemo(() => {
    const source = externalOptions ?? options;
    if (!filterOptions) return source;
    return source.filter(filterOptions);
  }, [externalOptions, filterOptions, options]);

  return (
    <div className="relative">
      <Select
        className={className}
        value={value}
        disabled={disabled}
        loading={isFetching}
        showSearch={showSearch}
        allowClear={allowClear ?? true}
        autoFocus={autoFocus}
        popupMatchSelectWidth={popupMatchSelectWidth}
        popupRender={popupRender}
        placeholder={placeholder ?? (showSearch ? t('general.search') : t('general.selectField'))}
        filterOption={filterOption}
        onClick={onClick}
        onChange={onChange}
        onSearch={(currentValue) => {
          if (infinite) {
            setSearchPhrase(currentValue);
            const hit = options.filter(
              (item) =>
                String(item?.title ?? '').includes(currentValue) ||
                String(item?.label ?? '').includes(currentValue),
            );
            if (hit.length === 1 && onSearchPhrase) {
              onSearchPhrase(hit[0].value as number, hit[0]?.title, hit);
              return;
            }
          }
          onSearch?.(currentValue);
        }}
        onPopupScroll={handleScroll}
        onClear={() => {
          if (infinite) {
            setSearchPhrase('');
            setPageNumber(1);
          }
          onClear?.();
        }}
        options={filteredOptions}
        notFoundContent={isFetching ? 'Loading...' : 'No options found'}
      />
      {showRefetch && (
        <div
          className={`${isFetching ? 'animate-spin' : ''} ${disabled ? 'opacity-50' : 'opacity-100'} absolute left-6 top-[0.65rem] cursor-pointer`}
          onClick={handleRefetch}
        >
          <Reload config={{ height: 16, width: 16 }} />
        </div>
      )}
    </div>
  );
};
