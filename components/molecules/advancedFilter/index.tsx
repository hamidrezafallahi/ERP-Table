import {
  useEffect,
  useState,
} from 'react';

import {
  dateFilterTypeOptions,
  numberFilterTypeOptions,
  selectFilterTypeOptions,
  stringFilterTypeOptions,
} from 'constants/filterType';
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
import BookmarkFilter
  from '@layout/baseLayout/desktop/actionBar/panelList/bookmarkFilter';
import SaveFilter
  from '@layout/baseLayout/desktop/actionBar/panelList/saveFilter';
import TagFilters
  from '@layout/baseLayout/desktop/actionBar/panelList/tagFilters';
import { useAppSelector } from '@redux/index';

import ShowBookmarkFilter from './showBookmarkFilter';
import ShowTagFilters from './showTagFilters';
import type {
  IAdvancedFilter,
  IData,
  IProps,
} from './type';

export default function AdvancedFilter({
  data,
  onReset,
  onApplyFilters,
  viewData = null,
  defaultFilters,
}: IProps) {
  const t = useTranslations();
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  },shallowEqual);
  const [filters, setFilters] = useState<IAdvancedFilter[]>([]);
  const [counter, setCounter] = useState(0);

  const handleFieldChange = (id: number, value: any) => {
    setFilters(
      filters.map((filter) =>
        filter.id === id
          ? { ...filter, field: value, value: undefined, type: undefined }
          : filter
      )
    );
  };

  const handleFilterValueChange = (id: number, value: any) => {
    setFilters(
      filters.map((filter) =>
        filter.id === id ? { ...filter, value: value } : filter
      )
    );
  };

  const handleFilterTypeChange = (id: number, value: any) => {
    setFilters(
      filters.map((filter) =>
        filter.id === id ? { ...filter, type: value } : filter
      )
    );
  };

  const handleAddFilter = () => {
    setCounter(counter + 1);
    setFilters([
      ...filters,
      { id: counter, field: undefined, value: undefined, type: undefined },
    ]);
  };

  const removeFieldHandler = (id: number) => {
    setFilters(filters.filter((filter) => filter.id !== id));
  };

  const handleResetFilters = () => {
    setFilters([]);
    onReset();
  };

  const handleApplyFilters = () => {
    const appliedFilters = filters.filter(
      (filter) =>
        filter.field !== undefined &&
        // filter.value !== undefined &&
        filter.type !== undefined
    );

    onApplyFilters(appliedFilters);
  };

  const staticFilterTypeOptions = {
    string: stringFilterTypeOptions,
    number: numberFilterTypeOptions,
    date: dateFilterTypeOptions,
    select: selectFilterTypeOptions,
  };

  useEffect(() => {
    if (viewData) {
      const newFilters = viewData.Filters?.FilterInfo.map((item) => {
        setCounter((prevCounter) => prevCounter + 1);
        return {
          id: counter,
          field: item.ColName,
          value: item.Value,
          type: item.FilterType,
        };
      });

      setFilters((prevFilters) => [...prevFilters, ...newFilters]);
    } else {
      if (defaultFilters && defaultFilters.length > 0) {
        const newFilters = defaultFilters.map((item) => {
          setCounter((prevCounter) => prevCounter + 1);
          return {
            id: counter,
            field: item.ColName ?? item.InnerFilterId,
            value: item.Value,
            type: item.FilterType,
          };
        });
        setFilters((prevFilters) => [...prevFilters, ...newFilters]);
      }
    }
  }, []);
  const renderSelect = ({
    dataType,
    filter,
  }: {
    dataType: IData;
    filter: IAdvancedFilter;
  }) => {
    if (dataType?.type in staticFilterTypeOptions) {
      return (
        <CustomSelect
          key={filter.id}
          className="w-[150px]"
          value={filter.type}
          placeholder={t("general.selectField")}
          onChange={(value) => handleFilterTypeChange(filter.id, value)}
          options={staticFilterTypeOptions[dataType.type]}
        />
      );
    } else {
      return (
        <CustomSelect
          disabled
          className="w-[150px]"
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
    dataType: IData;
    filter: IAdvancedFilter;
  }) => {
    if (filter.type === "ftNotNull" || filter.type === "ftIsNull") return null;
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
        if (dataType?.valueOption.Options) {
          const options = dataType?.valueOption.Options.map((item) => {
            return {
              label: item.caption,
              value: item.value,
              title: item.caption,
            };
          });
          return (
            <CustomSelect
              key={filter.id}
              className="w-[150px]"
              value={filter?.value}
              placeholder={t("general.selectField")}
              onChange={(value) => {
                handleFilterValueChange(filter.id, value);
              }}
              options={options}
            />
          );
        }
        return (
          <DynamicSelect
            showId
            infinite
            showSearch
            allowClear
            dynamicValue={dataType?.valueOption}
            className="w-[150px]"
            value={filter?.value}
            onChange={(value) => {
              handleFilterValueChange(filter.id, value);
            }}
            onSearchPhrase={(correctOption) =>
              handleFilterValueChange(filter.id, correctOption)
            }
          />
        );
      default:
        return (
          <CustomSelect
            disabled
            className="w-[150px]"
            value={undefined}
            placeholder={t("general.selectField")}
            onChange={() => null}
            options={[]}
          />
        );
    }
  };

  return (
    <div className="flex flex-col justify-between px-3 py-6">
      <>
        <div className="flex flex-col justify-start gap-2">
          {!match && (
            <>
              <BookmarkFilter />
              <TagFilters />
              <SaveFilter />
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
        <div className="flex flex-col justify-start pb-2">
          <ShowBookmarkFilter />
          <ShowTagFilters />
        </div>
        <ul className="hidden-show-scrollBar h-auto lg:!max-h-[25rem] overflow-y-scroll">
          {filters.map((filter) => {
            const dataType: IData = data?.find(
              (e) => e?.value === filter?.field
            );

            return (
              <li key={filter.id}>
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
                    className="w-[150px]"
                    value={filter?.field}
                    placeholder={t("general.selectField")}
                    onChange={(value) => handleFieldChange(filter.id, value)}
                    options={data.map((item) => ({
                      label: item.label,
                      title: item.label,
                      value: item.value,
                    }))}
                  />

                  {renderSelect({ dataType, filter })}

                  {renderField({ dataType, filter })}

                  {match && (
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
