import {
  useEffect,
  useState,
} from 'react';

import { useTranslations } from 'next-intl';
import {
  TimePicker,
  type TimePickerProps,
} from 'react-persian-range-picker';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CalenderIcon } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setPageData } from '@slice/pages';
import { IFormFieldConfig } from '@type/elementType';

interface IProps extends TimePickerProps {
  config?: IFormFieldConfig;
}
export const NewTimePicker = ({
  onChange,
  config,
  disabled = false,
  className,
  Style,
  ...restProps
}: IProps) => {
  const [inputValue, setInputValue] = useState<number>();
  const dispatch = useDispatch();

  const { locale, initElement } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
      initElement: config
        ? state.withPersist.pages
            .find((item) => item.isActive)
            ?.pageData?.find((element) => element.name === config.name)
            ?.value ?? null
        : undefined,
    }),
    shallowEqual
  );

  const defaultClass = ` dark:!bg-gray-gray95 dark:!text-white !bg-gray-gray3 rounded !w-full ${className} !border-none ${
    disabled && "!bg-[#ECECEC] !text-[#b1b1b1] "
  } `;

  const handleChange = (e: number) => {
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
        setInputValue(new Date(initElement).valueOf());
      }
    }
  }, [initElement, config]);
  const t = useTranslations();

  return (
    <>
      {config ? (
        disabled ? (
          <div
            className={`flex justify-between !h-[42px] lg:!h-[2.125rem] items-center p-2 rounded w-full cursor-not-allowed ${defaultClass}`}
            style={{ ...Style }}
          >
            <span className="font-normal text-gray-gray8 dark:text-white text-sm">
              {t("general.timeSelection")}
            </span>
            <CalenderIcon />
          </div>
        ) : (
          <TimePicker
            {...restProps}
            value={inputValue}
            onChange={handleChange}
            timeButtonClassName={defaultClass}
            disabled={disabled}
            calendarType={locale === "fa" ? "jalali" : "gregorian"}
            Style={{ ...Style, width: "100%" }}
          />
        )
      ) : (
        <TimePicker
          {...restProps}
          onChange={handleChange}
          calendarType={locale === "fa" ? "jalali" : "gregorian"}
          Style={{ ...Style, width: "100%" }}
          timeButtonClassName={defaultClass}
        />
      )}
    </>
  );
};
