"use client";

import React, { FC, useEffect, useMemo, useState } from 'react';

import { useRemoteQuery, useTranslations } from '../host';
import { Reload, Select } from '../primitives';

type DependOn = { fieldName: string; value: unknown };
type SelectOption = {
  _SelectId: string | number;
  _SelectValue?: string;
  _SelectDisplay?: string;
};

export interface ERPTableDynamicSelectProps {
  className?: string;
  value?: unknown;
  onChange?: (value: unknown, option?: unknown) => void;
  dynamicValue: any;
  showId?: boolean;
  infinite?: boolean;
  onSearchPhrase?: (
    correctOptionValue: number,
    correctOptionTitle?: string,
    option?: unknown,
  ) => void;
  showSearch?: boolean;
  onOptionsChange?: (options: any[]) => void;
  labelValue?: 'selectDisplay' | 'selectValue';
  selectFirstDefault?: boolean;
  displayFormatter?: (option: SelectOption) => string;
  disabled?: boolean;
  showRefetch?: boolean;
  noCache?: boolean;
  filterOptions?: (option: any) => boolean;
  filterOption?: (input: string, option: any) => boolean;
  options?: any[];
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
  const [options, setOptions] = useState<any[]>([]);
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

  const getOptionLabel = (option: SelectOption) => {
    if (displayFormatter) return displayFormatter(option);
    return option._SelectDisplay;
  };

  const hasDependValue = (dependency: DependOn | DependOn[] | undefined) => {
    if (!dependency) return true;
    if (Array.isArray(dependency)) {
      return dependency.every((item) => item.value !== null && item.value !== undefined);
    }
    return dependency.value !== null && dependency.value !== undefined;
  };

  const dependencySource = dependOn ?? dependsOn;
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

  const { data, isFetching, refetch } = useRemoteQuery<SelectOption[]>({
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
    const mapOption = (option: SelectOption) => ({
      key: option._SelectId,
      value: option._SelectId,
      label: labelValue === 'selectValue' ? option._SelectValue : getOptionLabel(option),
      title: getOptionLabel(option),
      option,
    });
    const dynamicOptions = (data.Data as SelectOption[]).map(mapOption);
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
