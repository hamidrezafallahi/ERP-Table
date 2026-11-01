"use client";

import React, { FC, useEffect, useMemo, useRef, useState } from 'react';

import {
  useHostDependOn,
  useLazyRemote,
  useTranslations,
} from '../host';
import type { DependOn } from '../host/dependOn';
import { Reload, Select } from '../primitives';
import type { SelectOption as UiSelectOption } from '../primitives/Select';

/**
 * Behavioural port of arianERP `atoms/defaultElements/dynamicSelect` (+ its
 * `CustomSelect` wrapper) onto the dependency-free `Select` primitive.
 * Redux / form-field (`config`), mobile and "add new" specifics are host
 * concerns and are intentionally not part of the package.
 */

type RemoteSelectOption = {
  _SelectId: string | number;
  _SelectValue?: string;
  _SelectDisplay?: string;
};
export type MappedSelectOption = {
  key: string | number;
  value: string | number;
  label?: string;
  title?: string;
  option?: RemoteSelectOption;
  children?: MappedSelectOption[];
};
type DynamicSelectSource = {
  endpoint?: string;
  repoViewId?: string;
  dependOn?: DependOn;
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
  /** Accepted for API parity; the select is always searchable (as in the host). */
  showSearch?: boolean;
  onOptionsChange?: (options: MappedSelectOption[]) => void;
  labelValue?: 'selectDisplay' | 'selectValue';
  selectFirstDefault?: boolean;
  displayFormatter?: (option: RemoteSelectOption) => string | undefined;
  disabled?: boolean;
  /** Reload icon. Shown unless explicitly `false` (host default). */
  showRefetch?: boolean;
  noCache?: boolean;
  /** Filters the loaded option list itself (e.g. `isUnique` columns). */
  filterOptions?: (option: MappedSelectOption) => boolean;
  /** Search-box matcher. Default: case-insensitive `label` contains. */
  filterOption?: (input: string, option: UiSelectOption) => boolean;
  options?: MappedSelectOption[];
  /** Label shown for `value` while it is not (yet) in the loaded options. */
  valueLabel?: string;
  onClear?: () => void;
  onClick?: () => void;
  autoFocus?: boolean;
  popupMatchSelectWidth?: number | boolean;
  popupRender?: (menu: React.ReactNode) => React.ReactNode;
  placeholder?: React.ReactNode;
  allowClear?: boolean;
  onSearch?: (value: string) => void;
}

const PAGE_RECORD_COUNT = 5000;
const DEPEND_DEBOUNCE_MS = 808;

const findOptionWithTitle = (data: MappedSelectOption[], searchTerm: string) => {
  const results: MappedSelectOption[] = [];
  const search = (items: MappedSelectOption[]) => {
    items.forEach((item) => {
      if (
        String(item?.title ?? '').includes(searchTerm) ||
        String(item?.label ?? '').includes(searchTerm)
      ) {
        results.push(item);
      }
      if (item.children && item.children.length > 0) search(item.children);
    });
  };
  search(data);
  return results;
};

export const ERPTableDynamicSelect: FC<ERPTableDynamicSelectProps> = ({
  className,
  value,
  onChange,
  dynamicValue,
  showId = false,
  infinite = false,
  onSearchPhrase,
  showSearch = true,
  onOptionsChange,
  labelValue = 'selectDisplay',
  selectFirstDefault = false,
  displayFormatter,
  disabled,
  showRefetch,
  filterOptions,
  valueLabel,
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

  const {
    endpoint,
    repoViewId,
    // UI-only flag of the host's select config; never part of the request body.
    addButton: _addButton,
    dependOn,
    ...bodyRequest
  } = dynamicValue ?? {};

  const getOptionLabel = (option: RemoteSelectOption) => {
    if (displayFormatter) return displayFormatter(option);
    return option._SelectDisplay;
  };

  const [getData, { data, isFetching }] = useLazyRemote<RemoteSelectOption[]>();
  const { dependencyBody, dependencyKey, isReady } = useHostDependOn(dependOn, {
    enabled: false,
    unwrapObjectValue: true,
  });

  const body = {
    ...bodyRequest,
    ...dependencyBody,
    PagingInfo: infinite
      ? { PageRecordCount: PAGE_RECORD_COUNT, PageNumber: pageNumber }
      : null,
    RepoViewId: repoViewId,
  };
  const existBody = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== null),
  );

  const handleRefetch = () => {
    setPageNumber(1);
    if (dependOn && !isReady) return;
    void getData({ url: endpoint, body: existBody });
  };

  useEffect(() => {
    if (!data?.Data) return;
    const dynamicOptions: MappedSelectOption[] = data.Data.map((option) => ({
      key: option._SelectId,
      value: option._SelectId,
      label:
        labelValue === 'selectValue'
          ? option._SelectValue
          : getOptionLabel(option),
      title: getOptionLabel(option),
      option,
    }));
    if (infinite) {
      if (pageNumber === 1) {
        setOptions(dynamicOptions);
      } else {
        setOptions((prev) => [...prev, ...dynamicOptions]);
        if (showId && selectFirstDefault) onChange?.(dynamicOptions[0]?.value);
      }
    } else {
      setOptions(dynamicOptions);
    }
  }, [data?.Data]);

  useEffect(() => {
    if (infinite && searchPhrase && searchPhrase.length > 2) setPageNumber(1);
  }, [searchPhrase]);

  useEffect(() => {
    if (onOptionsChange && options) onOptionsChange(options);
    if (selectFirstDefault) onChange?.(options[0]?.value);
  }, [options, onOptionsChange]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom = target.scrollHeight === target.scrollTop + target.clientHeight;
    if (infinite && bottom && !isFetching) {
      data?.ReturnCount === PAGE_RECORD_COUNT && setPageNumber((prev) => prev + 1);
    }
  };

  const filteredOptions = useMemo(() => {
    const source = externalOptions ?? options;
    if (!filterOptions) return source;
    return source.filter(filterOptions);
  }, [externalOptions, options, filterOptions]);

  const { selectOptions, selectValue } = useMemo(() => {
    if (value === null || value === undefined || value === '') {
      return { selectOptions: filteredOptions, selectValue: value };
    }
    const matched = filteredOptions.find(
      (option) => String(option.value) === String(value),
    );
    if (matched) {
      return { selectOptions: filteredOptions, selectValue: matched.value };
    }
    if (valueLabel) {
      return {
        selectOptions: [
          ...filteredOptions,
          { key: value as string | number, value: value as string | number, label: valueLabel, title: valueLabel },
        ],
        selectValue: value,
      };
    }
    return { selectOptions: filteredOptions, selectValue: value };
  }, [filteredOptions, value, valueLabel]);

  useEffect(() => {
    if (value === null || value === undefined) {
      setSearchPhrase(null);
      setPageNumber(1);
    }
  }, [value]);

  const dependOnKey = useMemo(
    () => (dependOn ? JSON.stringify(dependOn) : null),
    [dependOn],
  );

  const isFirstDependRun = useRef(true);
  useEffect(() => {
    if (isFirstDependRun.current) {
      isFirstDependRun.current = false;
      return undefined;
    }
    const debounce = setTimeout(() => {
      if (dependOn && isReady) {
        void getData({ url: endpoint, body: existBody });
      }
    }, DEPEND_DEBOUNCE_MS);
    return () => clearTimeout(debounce);
  }, [dependOnKey, dependencyKey]);

  useEffect(() => {
    if (isReady) void getData({ url: endpoint, body: existBody });
  }, []);

  return (
    <div className="relative">
      <Select
        className={`pdg-dynamic-select ${disabled ? 'is-disabled' : ''} ${className ?? ''}`}
        value={selectValue}
        disabled={disabled}
        showSearch
        allowClear={allowClear ?? true}
        autoFocus={autoFocus}
        popupMatchSelectWidth={popupMatchSelectWidth}
        popupRender={popupRender}
        placeholder={
          placeholder ??
          (showSearch ? t('general.search') : t('general.selectField'))
        }
        optionRender={(originNode) => (
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 'fit-content' }}
          >
            <span>{originNode.data.title}</span>
          </div>
        )}
        filterOption={(input, option) => {
          if (filterOption && typeof filterOption === 'function') {
            return filterOption(input, option);
          }
          const label = option?.label;
          return (
            typeof label === 'string' &&
            label.toLowerCase().includes(input.toLowerCase())
          );
        }}
        onClick={onClick}
        onChange={onChange}
        onSearch={(currentValue) => {
          if (infinite) {
            setSearchPhrase(currentValue);
            const correctOption = findOptionWithTitle(options, currentValue);
            if (correctOption.length === 1 && onSearchPhrase) {
              onSearchPhrase(
                correctOption[0].value as number,
                correctOption[0]?.title,
                correctOption,
              );
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
        options={selectOptions}
        notFoundContent={isFetching ? 'Loading...' : 'No options found'}
      />
      {showRefetch !== false && (
        <div
          className={`${isFetching ? 'animate-spin' : ''} ${disabled ? 'opacity-50' : 'opacity-100'}`}
          style={{ position: 'absolute', top: '0.65rem', left: '2rem', cursor: 'pointer', transition: 'all 0.4s' }}
          onClick={handleRefetch}
        >
          <Reload config={{ height: 16, width: 16 }} />
        </div>
      )}
    </div>
  );
};
