import moment from "moment-jalaali";
import { shallowEqual } from "react-redux";

import {
  CustomSelect,
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";
import { CloseCircle } from "@components/atoms/iconComponents";
import { useAppSelector } from "@redux/index";
import type { IFormField } from "@type/elementType";

export default function QuickFilters({ handleRemove, handleChange, fields }) {
  const { activePage, locale } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages.find((item) => item.isActive),
      locale: state.withPersist.config.lang,
    }),
    shallowEqual,
  );

  const filters = activePage?.viewData?.Filters?.FilterInfo;
  const renderFormField = (field: IFormField) => {
    switch (field.type) {
      case "string":
        return (
          <InputText
            name={field.fieldName}
            // placeholder={t("general.enterValue")}
            allowClear={{
              clearIcon: (
                <span onClick={() => handleRemove(field)}>
                  <CloseCircle />
                </span>
              ),
            }}
            value={filters.find((i) => i.ColName === field.fieldName)?.Value}
            size="middle"
            className={`flex items-center border-1 hover:border-gray-gray5 focus:border-gray-gray5 active:border-gray-gray5 rounded-md ring-0 focus:ring-0 min-w-[152px] text-sm`}
            onChange={(event) => {
              if (event.target.value.length > 2) {
                handleChange(
                  field.fieldName,
                  event.target.value,
                  field.fieldType,
                );
              }
            }}
          />
        );
      case "number":
        return (
          <InputText
            name={field.fieldName}
            // placeholder={t("general.enterValue")}
            allowClear={{
              clearIcon: (
                <span onClick={() => handleRemove(field)}>
                  <CloseCircle />
                </span>
              ),
            }}
            value={filters.find((i) => i.ColName === field.fieldName)?.Value}
            size="middle"
            className="flex items-center border-1 hover:border-gray-gray5 focus:border-gray-gray5 active:border-gray-gray5 rounded-md ring-0 focus:ring-0 min-w-[152px] text-sm"
            onChange={(event) => {
              if (
                event.target.value &&
                event.target.value.length > 0 &&
                event.target.value !== ""
              ) {
                handleChange(
                  field.fieldName,
                  event.target.value,
                  field.fieldType,
                );
              }
            }}
          />
        );
      case "date": {
        const value = filters.find((i) => i.ColName === field.fieldName)?.Value;
        const temp = value
          ? locale === "fa"
            ? moment(value).valueOf()
            : moment(value).utc().valueOf()
          : undefined;

        return (
          <NewDatePicker
            onChange={(date) => {
              handleChange(field.fieldName, date, field.fieldType);
            }}
            defaultValue={temp}
          />
        );
      }

      case "select":
        if (field?.valueOption?.Options?.length > 0) {
          const options = field?.valueOption.Options.map((item) => {
            return {
              label: item.caption,
              value: item.value,
              title: item.caption,
            };
          });
          const currentValue = filters.find(
            (i) => i.ColName === field.fieldName,
          )?.Value;
          const defaultValue = options.find((i) => i.value === currentValue);
          return (
            <CustomSelect
              className="w-[150px]"
              value={defaultValue}
              // placeholder={t("general.selectField")}
              onChange={(value) => {
                handleChange(
                  field.fieldName,
                  value?.toString(),
                  field.fieldType,
                );
              }}
              options={options}
              onClear={() => handleRemove(field)}
            />
          );
        }
        return (
          <DynamicSelect
            value={filters.find((i) => i.ColName === field.fieldName)?.Value}
            dynamicValue={field?.valueOption}
            className="rounded w-full min-w-[152px]"
            onChange={(value) => {
              if (value) {
                handleChange(
                  field.fieldName,
                  value?.toString(),
                  field.fieldType,
                );
              }
            }}
            onClear={() => handleRemove(field)}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-2 pb-4 transition-transform duration-200 ease-in-out">
      {fields?.map((field, index: number) => (
        <div key={index}>
          <span className="font-bold text-gray-gray10 dark:text-white text-xs">
            {field.label}
          </span>
          {renderFormField(field)}
        </div>
      ))}
    </div>
  );
}
