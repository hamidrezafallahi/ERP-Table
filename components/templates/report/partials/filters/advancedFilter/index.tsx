import {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  CustomButton,
  CustomSelect,
  CustomTooltip,
  DynamicSelect,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import { Close } from '@components/atoms/iconComponents';
import {
  dateFilterTypeOptions,
  numberFilterTypeOptions,
  selectFilterTypeOptions,
  stringFilterTypeOptions,
} from '@constants/filterType';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { IFilterData } from '@type/filterTypes';

import type {
  AdvancedFilterProps,
  IAdvancedFilter,
} from './type';

export default function AdvancedFilter({
  data,
  onReset,
  onApplyFilters,
  viewData = null,
  defaultFilters,
}: AdvancedFilterProps) {
  const t = useTranslations();
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);
  const [filters, setFilters] = useState<IAdvancedFilter[]>(
    defaultFilters
      ? defaultFilters.map((item, index) => {
          return {
            id:  index ,
            field: item.ColName ?? item.InnerFilterId,
            value: item.Value,
            type: item.FilterType,
          };
        })
      : [
          {
            id:  Math.random() ,
            field: undefined,
            value: undefined,
            type: undefined,
          },
        ],
  );

  const handleFieldChange = (id: number, value: any) => {
    setFilters(
      filters.map((filter) =>
        filter.id === id
          ? { ...filter, field: value, value: undefined, type: undefined }
          : filter,
      ),
    );
  };

  const handleFilterValueChange = (id: number, value: any) => {
    setFilters((prev) =>
      prev.map((filter) =>
        filter.id === id ? { ...filter, value: value } : filter,
      ),
    );
  };

  const handleFilterTypeChange = (id: number, value: any) => {
    setFilters((prev) =>
      prev.map((filter) =>
        filter.id === id ? { ...filter, type: value } : filter,
      ),
    );
  };

  const handleAddFilter = () => {
    setFilters((prev) => [
      ...prev,
      { id:Math.random(), field: undefined, value: undefined, type: undefined },
    ]);
  };

  const removeFieldHandler = (id: number) => {
    setFilters((prev) => prev.filter((filter) => filter.id !== id));
  };

  const handleResetFilters = () => {
    setFilters([]);
    onReset();
  };

  const handleApplyFilters = () => {
    const appliedFilters = filters.filter(
      (filter) =>
        filter.field !== undefined &&
        filter.value !== undefined &&
        filter.type !== undefined,
    );

    onApplyFilters(appliedFilters);
  };

  const staticFilterTypeOptions = {
    string: stringFilterTypeOptions,
    number: numberFilterTypeOptions,
    date: dateFilterTypeOptions,
    select: selectFilterTypeOptions,
    dynamicSelect: selectFilterTypeOptions,
    multiSelect: selectFilterTypeOptions,
    dynamicMultiSelect: selectFilterTypeOptions,
  };

  useEffect(() => {
    if (viewData) {
      const newFilters = viewData.Filters?.FilterInfo.map((item, index) => {
        return {
          id:  index,
          field: item.ColName,
          value: item.Value,
          type: item.FilterType,
        };
      });

      setFilters((prevFilters) => [...prevFilters, ...newFilters]);
    }
  }, [viewData?.Filters?.FilterInfo]);
  const renderSelect = ({
    dataType,
    filter,
  }: {
    dataType: IFilterData;
    filter: IAdvancedFilter;
  }) => {
    if (dataType?.type in staticFilterTypeOptions && filter.field) {
      return (
        <CustomSelect
          className="!w-[120px]"
          value={filter.type}
          placeholder={t("general.selectField")}
          onChange={(value) => handleFilterTypeChange(filter.id, value)}
          options={staticFilterTypeOptions[dataType.type]}
        />
      );
    } else {
      return (
        <CustomSelect
          key={`select-${filter.id}`}
          disabled
          className="!w-[120px]"
          value={undefined}
          placeholder={t("general.selectField")}
          onChange={() => null}
          options={[]}
        />
      );
    }
  };

  const renderField = ({
    dataType,
    filter,
  }: {
    dataType: IFilterData;
    filter: IAdvancedFilter;
  }) => {
    const options = dataType?.options?.map((item) => {
      return {
        label: item.caption,
        value: item.value,
        title: item.caption,
      };
    });
    if (filter.type === "ftNotNull" || filter.type === "ftIsNull") return null;
    const key = `field-${filter.id}-${Math.random()}`;
    switch (dataType?.type) {
      case "string":
        return (
          <InputText
            name={filter.field as string}
            placeholder={t("general.enterValue")}
            size="middle"
            defaultValue={filter?.value}
            className="flex items-center border-1 hover:border-gray-gray5 focus:border-gray-gray5 active:border-gray-gray5 rounded-md ring-0 focus:ring-0 w-[150px] text-sm"
            onChange={(event) =>
              handleFilterValueChange(filter.id, event.target.value)
            }
          />
        );
      case "number":
        return (
          <InputText
            name={filter.field as string}
            defaultValue={filter?.value}
            placeholder={t("general.enterValue")}
            size="middle"
            className="flex items-center border-1 hover:border-gray-gray5 focus:border-gray-gray5 active:border-gray-gray5 rounded-md ring-0 focus:ring-0 w-[150px] text-sm"
            onChange={(event) =>
              handleFilterValueChange(filter.id, event.target.value)
            }
          />
        );
      case "date":
        return (
          <NewDatePicker
            onChange={(date) => {
              handleFilterValueChange(filter.id, date);
            }}
          />
        );
      case "select":
        return (
          <div className="w-full">
            <CustomSelect
              key={key}
              value={filter?.value}
              placeholder={t("general.selectField")}
              onChange={(value) => {
                handleFilterValueChange(filter.id, value);
              }}
              options={options}
            />
          </div>
        );
      case "multiSelect":
        return (
          <div className="w-full">
            <CustomSelect
              key={key}
              mode="multiple"
              className="w-full"
              value={filter?.value}
              placeholder={t("general.selectField")}
              onChange={(value) => {
                handleFilterValueChange(filter.id, value);
              }}
              options={options}
            />
          </div>
        );
      case "dynamicSelect":
        return (
          <div className="w-full">
            <DynamicSelect
              key={key}
              showId
              infinite
              showSearch
              allowClear
              dynamicValue={dataType?.dynamicValue}
              className="!flex-1"
              value={filter?.value}
              onChange={(value) => {
                handleFilterValueChange(filter.id, value);
              }}
              onSearchPhrase={(correctOption) =>
                handleFilterValueChange(filter.id, correctOption)
              }
            />
          </div>
        );
      case "dynamicMultiSelect":
        return (
          <div className="w-full">
            <DynamicSelect
              key={key}
              showSearch
              mode="multiple"
              maxTagCount={2}
              allowClear
              dynamicValue={dataType?.dynamicValue}
              className="!flex-1 overflow-hidden"
              value={filter?.value}
              onChange={(value) => {
                handleFilterValueChange(filter.id, value);
              }}
            />
          </div>
        );
      default:
        return (
          <div className="w-full">
            <CustomSelect
              key={key}
              disabled
              value={undefined}
              placeholder={t("general.selectField")}
              onChange={() => null}
              options={[]}
            />
          </div>
        );
    }
  };
  return (
    <div className="flex flex-col justify-between px-3 py-6">
      <>
        <div className="flex flex-col justify-start gap-2">
          {!match && (
            <>
              <CustomButton
                type="text"
                className="bg-black-black8 hover:bg-white px-3 py-2 border hover:border-black-black8 rounded text-white text-xs"
                onClick={handleAddFilter}
              >
                {t("general.add")}
              </CustomButton>
            </>
          )}
        </div>
        <div className="flex flex-col justify-start pb-2"></div>
        <ul className="hidden-show-scrollBar h-auto lg:!max-h-[25rem] overflow-y-scroll">
          {filters.map((filter, idx) => {
            const dataType: IFilterData = data?.find(
              (e) => e?.value === filter?.field,
            );
            return (
              <li key={idx}>
                {!match && (
                  <div className="flex justify-end pt-2">
                    <CustomButton
                      type="text"
                      className="bg-gray-gray5 dark:bg-gray-gray12 px-3 py-1 border hover:border-black-black8 rounded text-main-black"
                      onClick={() => removeFieldHandler(filter.id)}
                    >
                      <CustomTooltip title={t("general.delete")}>
                        <div className="flex justify-center items-center gap-1">
                          <Close config={{ width: 8, height: 8 }} />
                        </div>
                      </CustomTooltip>
                    </CustomButton>
                  </div>
                )}

                <div className="flex lg:flex-row flex-col gap-2 py-2 border-b border-dashed">
                  <CustomSelect
                    className="min-w-[150px]"
                    value={filter?.field}
                    placeholder={t("general.selectField")}
                    optionLabelProp="label"
                    onChange={(value) => handleFieldChange(filter.id, value)}
                    options={data.map((item, idx) => ({
                      label: item.label,
                      title: item.label,
                      value: item.value,
                      key: `${item.value}_${idx}`,
                    }))}
                  />

                   {renderSelect({ dataType, filter })}

                  {renderField({ dataType, filter })}

                  {match && (
                    <CustomTooltip title={t("general.delete")}>
                      <CustomButton
                        type="text"
                        className="bg-gray-gray5 dark:bg-gray-gray12 px-3 border hover:border-black-black8 rounded h-[34px] text-main-black"
                        onClick={() => removeFieldHandler(filter.id)}
                      >
                        <div className="flex justify-center items-center gap-1">
                          <Close config={{ width: 8, height: 8 }} />
                        </div>
                      </CustomButton>
                    </CustomTooltip>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </>

      <div className="flex justify-end lg:justify-between items-center gap-2 bg-white dark:bg-gray-gray12 px-2 pt-4 w-full text-xs">
        {match && (
          <CustomButton
            type="text"
            className="bg-black-black8 hover:bg-white px-3 py-1 border hover:border-black-black8 rounded text-white text-xs"
            onClick={handleAddFilter}
          >
            {t("general.add")}
          </CustomButton>
        )}
        <div className="flex gap-2">
          <CustomButton
            type="text"
            onClick={handleResetFilters}
            className="bg-gray-gray5 dark:bg-gray-gray12 px-3 py-1 border hover:border-black-black8 rounded text-main-black text-xs"
          >
            {t("general.clearFilters")}
          </CustomButton>
          <CustomButton
            type="text"
            onClick={handleApplyFilters}
            className="bg-black-black8 hover:bg-white px-3 py-1 border hover:border-black-black8 rounded text-white hover:text-black-black8 text-xs"
          >
            {t("general.applyFilters")}
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
