import {
  useEffect,
  useState,
} from 'react';

import {
  Mask,
  type MaskProps,
} from 'react-persian-range-picker';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@redux/index';
import { setPageData } from '@slice/pages';
import { IFormFieldConfig } from '@type/elementType';

interface IProps extends MaskProps {
  config?: IFormFieldConfig;
  className?: string;
}
export const NewMask = ({
  onMaskChange,
  config,
  className,
  ...restProps
}: IProps) => {
  const [inputValue, setInputValue] = useState<number>();
  const dispatch = useDispatch();
 const { match, initElement } = useAppSelector((state) => {
  const match = state.withPersist.config.initMatch;
  if (!config) return { match, initElement: null };
  const initElement =
    state.withPersist.pages
      .find((item) => item.isActive)
      ?.pageData?.find((element) => element.name === config.name)?.value ?? null;

  return { match, initElement };
}, shallowEqual);

  const { locale } = useAppSelector(
    (state) => ({
      locale: state.withPersist.config.lang,
    }),
    shallowEqual
  );

  const defaultClass = `dark:bg-gray-gray13 dark:text-gray-gray13 ${
    match ? "h-[2.125rem]" : "h-[42px] text-sm"
  } !bg-gray-gray3 rounded !w-full ${className} !border-none`;

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
    onMaskChange?.(e as any);
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
  return (
    <>
      {config ? (
        //   <TimePicker value={inputValue} onChange={handleChange} />
        <Mask
          {...restProps}
          defaultValue={inputValue}
          onMaskChange={handleChange}
          maskClassName={defaultClass}
          calendarType={locale == "fa" ? "jalali" : "gregorian"}
        />
      ) : (
        <Mask {...restProps} onMaskChange={handleChange} />
      )}
    </>
  );
};
