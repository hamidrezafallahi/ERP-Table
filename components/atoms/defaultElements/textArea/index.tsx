import { ChangeEvent, useEffect, useState } from "react";

import { Input } from "antd";
import { shallowEqual, useDispatch } from "react-redux";

import { useAppSelector } from "@redux/index";
import { setPageData } from "@slice/pages";

import type { IProps } from "./type";

export const CustomTextArea = ({
  onChange,
  config,
  className,
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

  const defaultClass = `h-[42px] lg:h-[2.125rem] text-sm 
   !bg-gray-gray3 dark:!bg-gray-gray11 rounded w-full ${className} !border-none `;

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
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
          value,
        })
      );
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
        <Input.TextArea
          {...rest}
          value={inputValue}
          className={defaultClass}
          onChange={handleChange}
          placeholder={config?.placeHolder}
        />
      ) : (
        <Input.TextArea
          {...rest}
          className={defaultClass}
          onChange={handleChange}
        />
      )}
    </>
  );
};
