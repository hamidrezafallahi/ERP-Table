import {
  useEffect,
  useState,
} from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setPageData } from '@slice/pages';

import { NewTimePicker } from '../newTimePicker';
import type { IProps } from './type';

export const TimePickerDesktop = ({
  onChange,
  config,
  className,
  ...rest
}: IProps) => {
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
  useEffect(() => {
    if (config) {
      const { name, setFieldValue } = config;
      if (setFieldValue) {
        setFieldValue(name, initElement);
      }
    }
  }, [initElement, config]);
  const [inputValue, setInputValue] = useState(initElement);

  const defaultClass = `dark:bg-gray-gray10 ${
    match ? "h-[2.125rem]" : "h-[42px] text-sm"
  } !bg-gray-gray3 rounded !w-full ${className} !border-none `;

  const handleChange = (e: number) => {
    setInputValue(e);
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
    onChange?.(e);
  };
  useEffect(() => {
    if (initElement !== inputValue) {
      setInputValue(initElement);
    }
  }, [initElement]);
  return (
    <>
      {config ? (
        <NewTimePicker
          {...rest}
          defaultValue={inputValue}
          onChange={handleChange}
          timeButtonClassName={defaultClass}
        />
      ) : (
        <NewTimePicker onChange={handleChange} {...rest} />
      )}
    </>
  );
};
