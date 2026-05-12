import {
  useEffect,
  useState,
} from 'react';

import {
  RangePicker,
  type RangePickerProps,
} from 'react-persian-range-picker';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@redux/index';
import { setPageData } from '@slice/pages';
import { IFormFieldConfig } from '@type/elementType';

interface IProps extends RangePickerProps {
  config?: IFormFieldConfig;
}
export const NewRangePicker = ({
  onChange,
  config,
  className,
  ...restProps
}: Omit<IProps, "locale">) => {
  const [inputValue, setInputValue] = useState<{ from: number; to: number }>();
  const dispatch = useDispatch();
  const { locale, initElement } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
      initElement: config
        ? (state.withPersist.pages
            .find((item) => item.isActive)
            ?.pageData?.find((element) => element.name === config.name)
            ?.value ?? null)
        : undefined,
    }),
    shallowEqual,
  );

  const defaultClass = `!bg-gray-gray3 dark:!bg-gray-gray10 rounded !w-full ${className} !border-none `;

  const handleChange = (e): void => {
    const { dataType, Data } = e;
    if (config) {
      const {
        caption,
        help,
        name,
        order,
        placeHolder,
        rules,
        type,
        selectEndpoint,
      } = config;
      if (dataType == "date") {
        dispatch(
          setPageData({
            caption,
            help,
            name,
            order,
            placeHolder,
            rules,
            type,
            selectEndpoint,
            value: Data.date,
          }),
        );
      }
    }
    onChange?.({ type: dataType, Data });
  };
  useEffect(() => {
    if (config) {
      const { name, setFieldValue } = config;
      if (setFieldValue) {
        setFieldValue(name, initElement);
      }
      if (initElement && initElement !== inputValue) {
        try {
          const parsed =
            typeof initElement === "object" &&
            "from" in initElement &&
            "to" in initElement
              ? {
                  from: new Date(initElement.from).valueOf(),
                  to: new Date(initElement.to).valueOf(),
                }
              : undefined;

          if (parsed) {
            setInputValue(parsed);
          }
        } catch (e) {
          console.error("Invalid date format in initElement:", initElement);
        }
      }
    }
  }, [initElement, config]);
  return (
    <>
      {config ? (
        //   <TimePicker value={inputValue} onChange={handleChange} />
        <RangePicker
          {...(restProps as any)}
          defaultValue={inputValue}
          onChange={handleChange}
          className={defaultClass}
          showComparison={false}
          exportType="IsoString"
          calendarType={locale == "fa" ? "jalali" : "gregorian"}
        />
      ) : (
        <RangePicker
          {...(restProps as any)}
          onChange={handleChange}
          exportType="IsoString"
          calendarType={locale == "fa" ? "jalali" : "gregorian"}
        />
      )}
    </>
  );
};
