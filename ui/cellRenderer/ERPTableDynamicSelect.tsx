// @ts-nocheck
"use client";
// Host-coupled dynamic select (antd + ERP list APIs).
import { FC, useEffect, useMemo, useState } from 'react';

import { Select, Spin } from 'antd';
import { useTranslations } from 'next-intl';

import { Reload } from '@components/atoms/iconComponents';
import { useGetData } from '@services/base';
import type { IDependOn, IOption, ISelectOption } from '@type/elementType';

interface ERPTableDynamicSelectProps extends Omit<React.ComponentProps<typeof Select>, 'value' | 'onChange' | 'filterOption'> {
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
  config?: unknown;
  onOptionsChange?: (options: IOption[]) => void;
  labelValue?: 'selectDisplay' | 'selectValue';
  selectFirstDefault?: boolean;
  displayFormatter?: (option: ISelectOption) => string;
  disabled?: boolean;
  showRefetch?: boolean;
  noCache?: boolean;
  filterOptions?: (option: IOption) => boolean;
  filterOption?: (input: string, option: any) => boolean;
  options?: IOption[];
  onClear?: () => void;
}

export const ERPTableDynamicSelect: FC<ERPTableDynamicSelectProps> = ({
  className,
  value,
  onChange,
  dynamicValue,
  showId = false,
  infinite = false,
  onSearchPhrase,
  showSearch = true,
  config,
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
  ...props
}) => {
  const t = useTranslations();
  const [options, setOptions] = useState<IOption[]>([]);
  const [searchPhrase, setSearchPhrase] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const pageRecordCount = 5000;

  const {
    endpoint,
    repoViewId,
    addButton,
    dependOn,
    dependsOn,
    ...bodyRequest
  } = dynamicValue ?? {};

  const getOptionLabel = (option: ISelectOption) => {
    if (displayFormatter) return displayFormatter(option);
    return option._SelectDisplay;
  };

  const hasDependValue = (dependency: IDependOn | IDependOn[] | undefined) => {
    if (!dependency) return true;

    if (Array.isArray(dependency)) {
      return dependency.every((item) => item.value !== null && item.value !== undefined);
    }

    return dependency.value !== null && dependency.value !== undefined;
  };

  const dependencySource = dependOn ?? dependsOn;

  const dependencyBody = Array.isArray(dependencySource)
    ? Object.fromEntries(
        dependencySource.map((item) => [item.fieldName, item.value]),
      )
    : dependencySource
      ? {
          [dependencySource.fieldName]: dependencySource.value,
        }
      : {};

  const body = {
    ...bodyRequest,
    ...dependencyBody,
    PagingInfo: infinite
      ? {
          PageRecordCount: pageRecordCount,
          PageNumber: pageNumber,
        }
      : null,
    RepoViewId: repoViewId,
  };

  const existBody = Object.fromEntries(
    Object.entries(body).filter(([, value]) => value !== null),
  );

  const { data, isFetching, refetch } = useGetData<ISelectOption[], null>({
    url: endpoint,
    body: existBody,
    skip: dependencySource ? !hasDependValue(dependencySource) : false,
    noCache,
  });

  const handleRefetch = () => {
    setPageNumber(1);
    if (dependencySource && !hasDependValue(dependencySource)) {
      console.log(dynamicValue);
      console.log(
        `هنوز وابستگی ${dependencySource} پر نشده که بخواهد داده واکشی کند  skip ٝعال هست هنوز `,
        dependencySource,
      );
    } else {
      refetch();
    }
  };

  useEffect(() => {
    if (!data?.Data) return;

    const mapOption = (option: ISelectOption) => ({
      key: option._SelectId,
      value: option._SelectId,
      label:
        labelValue === 'selectValue' ? option._SelectValue : getOptionLabel(option),
      title: getOptionLabel(option),
      option,
    });

    const dynamicOptions = data.Data.map(mapOption);

    if (infinite) {
      if (pageNumber === 1) {
        setOptions(dynamicOptions);
      } else {
        setOptions((prevState) => [...prevState, ...dynamicOptions]);
        if (selectFirstDefault) {
          onChange?.(dynamicOptions[0]?.value);
        }
      }
    } else {
      setOptions(dynamicOptions);
    }
  }, [data?.Data, infinite, labelValue, pageNumber, selectFirstDefault]);

  useEffect(() => {
    if (infinite && searchPhrase?.length && searchPhrase.length > 2) {
      setPageNumber(1);
    }
  }, [infinite, searchPhrase]);

  useEffect(() => {
    if (onOptionsChange) {
      onOptionsChange(options);
    }
    if (selectFirstDefault && options.length) {
      onChange?.(options[0]?.value);
    }
  }, [onChange, onOptionsChange, options, selectFirstDefault]);

  useEffect(() => {
    if (value === null || value === undefined) {
      setSearchPhrase(null);
      setPageNumber(1);
    }
  }, [value]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom =
      e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.clientHeight;

    if (infinite && bottom && !isFetching) {
      data?.ReturnCount === pageRecordCount && setPageNumber((prev) => prev + 1);
    }
  };

  const findOptionWithTitle = (items: IOption[], searchTerm: string) => {
    const results: IOption[] = [];
    const search = (currentItems: Array<IOption & { children?: Array<IOption & { children?: Array<IOption & { children?: IOption[] }> }> }>) => {
      currentItems.forEach((item) => {
        if (
          item?.title?.includes(searchTerm) ||
          item?.label?.includes(searchTerm)
        ) {
          results.push(item);
        }
        if (item.children && item.children.length > 0) {
          search(item.children as Array<IOption & { children?: Array<IOption & { children?: Array<IOption & { children?: IOption[] }> }> }>);
        }
      });
    };
    search(items as Array<IOption & { children?: Array<IOption & { children?: Array<IOption & { children?: IOption[] }> }> }>);
    return results;
  };

  const filteredOptions = useMemo(() => {
    const source = externalOptions ?? options;

    if (!filterOptions) return source;

    return source.filter(filterOptions);
  }, [externalOptions, filterOptions, options]);

  return (
    <div className="relative">
      <Select
        {...props}
        className={className}
        value={value}
        disabled={disabled}
        loading={isFetching}
        showSearch={showSearch}
        optionFilterProp="label"
        labelInValue={false}
        allowClear={props.allowClear ?? true}
        placeholder={
          props.placeholder
            ? props.placeholder
            : showSearch
              ? t('general.search')
              : t('general.selectField')
        }
        filterOption={(input, option) => {
          if (typeof props.filterOption === 'function') {
            return props.filterOption(input, option as any);
          }

          const label = option?.label;
          return (
            typeof label === 'string' &&
            label.toLowerCase().includes(input.toLowerCase())
          );
        }}
        onChange={onChange as any}
        onSearch={(currentValue) => {
          if (infinite) {
            setSearchPhrase(currentValue);
            const correctOption = findOptionWithTitle(options, currentValue);
            if (correctOption.length === 1) {
              if (onSearchPhrase) {
                return onSearchPhrase(
                  correctOption[0].value as number,
                  correctOption[0]?.title,
                  correctOption,
                );
              }
            }
          }
          props.onSearch?.(currentValue);
        }}
        onPopupScroll={handleScroll as any}
        onClear={() => {
          if (infinite) {
            setSearchPhrase('');
            setPageNumber(1);
          }
          onClear?.();
        }}
        options={filteredOptions as any}
        optionRender={(originNode, info) => {
          return (
            <div className="flex justify-between items-center !h-fit">
              <span>{originNode.data.title}</span>
            </div>
          );
        }}
        notFoundContent={isFetching ? 'Loading...' : 'No options found'}
      />
      {showRefetch && (
        <div
          className={`$${isFetching ? 'animate-spin' : ''} ${disabled ? 'opacity-50' : 'opacity-100'} absolute left-6 top-[0.65rem] cursor-pointer transition-all duration-400`}
          onClick={handleRefetch}
        >
          <Reload
            config={{
              height: 16,
              width: 16,
            }}
          />
        </div>
      )}
    </div>
  );
};
