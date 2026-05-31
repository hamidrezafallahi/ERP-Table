import {
  ChangeEvent,
  useEffect,
  useState,
} from 'react';

import Password from 'antd/es/input/Password';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { Eye } from '@components/atoms/iconComponents/icons/Eye';
import { EyeClose } from '@components/atoms/iconComponents/icons/EyeClose';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setPageData } from '@slice/pages';

import type { IProps } from './type';

export const InputPassword = ({
  className,
  onChange,
  config,
  ...rest
}: IProps) => {
  const dispatch = useDispatch();
  const { initElement } = useAppSelector((state) => {
    if (!config) return { initElement: null };
    const initElement =
      state.withPersist.pages
        .find((item) => item.isActive)
        ?.pageData?.find((element) => element.name === config.name)?.value ??
      null;

    return { initElement };
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
  const [passwordVisible, setPasswordVisible] = useState(false);

  const defaultClass = ` h-[42px] lg:h-[2.125rem] text-sm 
   !bg-gray-gray3 dark:!bg-gray-gray10 w-full ${className} !border-none `;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
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
          value: value,
        })
      );
    }

    onChange?.(e);
  };
  useEffect(() => {
    setInputValue(initElement);
  }, [initElement]);
  return (
    <>
      {config ? (
        <Password
          autoComplete={"true"}
          {...rest}
          className={defaultClass}
          onChange={handleChange}
          visibilityToggle={{
            visible: passwordVisible,
            onVisibleChange: () => {
              setPasswordVisible(!passwordVisible);
            },
          }}
          iconRender={(visible) => (
            <span onClick={() => setPasswordVisible(!passwordVisible)}>
              {visible ? <EyeClose /> : <Eye />}
            </span>
          )}
        />
      ) : (
        <Password
          value={inputValue}
          autoComplete={"true"}
          {...rest}
          className={defaultClass}
          onChange={handleChange}
          visibilityToggle={{
            visible: passwordVisible,
            onVisibleChange: () => {
              setPasswordVisible(!passwordVisible);
            },
          }}
          iconRender={(visible) => (
            <span onClick={() => setPasswordVisible(!passwordVisible)}>
              {visible ? <EyeClose /> : <Eye />}
            </span>
          )}
        />
      )}
    </>
  );
};
