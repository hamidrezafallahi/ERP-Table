import {
  useEffect,
  useState,
} from 'react';

import {
  useLocale,
  useTranslations,
} from 'next-intl';
import {
  DatePicker,
  type DatePickerProps,
} from 'react-persian-range-picker';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useDarkMode } from '@hooks/custom/useDarkMode';
import { setPageData } from '@slice/pages';
import { IFormFieldConfig } from '@type/elementType';

interface IProps extends DatePickerProps {
  config?: IFormFieldConfig;
}
export const NewDatePicker = ({
  config,
  disabled = false,
  className,
  onChange,
  Style,
  ...restProps
}: Omit<IProps, "locale">) => {
  const locale = useLocale();
  const { mode = "light" } = useDarkMode();
  const [inputValue, setInputValue] = useState<number | string>();
  const dispatch = useDispatch();
  const t = useTranslations();
  const { initElement } = useAppSelector((state) => {
    const initElement = config
      ? state.withPersist.pages
          .find((item) => item.isActive)
          ?.pageData?.find((element) => element.name === config.name)?.value
      : null;
    return { initElement };
  }, shallowEqual);

  const defaultClass = `dark:!bg-gray-gray95 dark:!text-white  
    !h-[42px] lg:!h-[2.125rem] text-sm !bg-gray-gray3 px-2 !rounded-sm w-full ${className} !border-none ${
    disabled && "!bg-[#ECECEC] !text-[#b1b1b1] "
  } `;

  const handleChange = (e: number) => {
    // {type:"date",Data:{date:{from:1111,to:222},compareDate:{from:1111,to:222}}}
    // setInputValue(value.from);
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
      if (e) {
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
            value: e,
          })
        );
      }
    }
    onChange?.(e as any);
  };
  useEffect(() => {
    if (config) {
      const { name, setFieldValue } = config;
      if (setFieldValue) {
        setFieldValue(name, initElement);
      }
      if (initElement && initElement !== inputValue) {
        setInputValue(initElement);
      }
    }
  }, [initElement, config]);
  return (
    <>
      {config ? (
        <DatePicker
          {...(restProps as any)}
          defaultValue={
            config && !disabled ? inputValue : restProps?.defaultValue
          }
          onChange={handleChange}
          className={defaultClass}
          showMask={!disabled}
          buttonClassName={!disabled ? "!w-full !bg-red-400" : undefined}
          disabled={disabled}
          Style={{ ...Style, width: "100%" }}
          highlightColor={mode === "dark" && "#676767"}
          calendarType={locale == "fa" ? "jalali" : "gregorian"}
        />
      ) : (
        <DatePicker
          {...(restProps as any)}
          className={defaultClass}
          Style={{ ...Style, width: "100%" }}
          highlightColor={mode === "dark" && "#676767"}
          onChange={handleChange}
          calendarType={locale == "fa" ? "jalali" : "gregorian"}
        />
      )}
    </>
  );
};
