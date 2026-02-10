import { KeyboardEvent, useEffect, useState } from "react";

import { InputNumber } from "antd";
import { shallowEqual, useDispatch } from "react-redux";

import { useAppSelector } from "@redux/index";
import { setPageData } from "@slice/pages";

import type { IProps } from "./type";

const CustomInputNumber = ({
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
        ?.pageData?.find((element) => element.name === config.name)?.value ??
      null;

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

  const defaultClass = `${
    match ? "h-[2.125rem]" : "h-[42px] text-sm"
  } !bg-gray-gray3 hover:!bg-gray-gray3 dark:hover:bg-darkHover rounded w-full dark:!bg-gray-gray95 dark:!text-white ${className} !border-none `;

  const handleChange = (e: any) => {
    setInputValue(e);
    onChange?.(e);
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
          value: e,
        }),
      );
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ];
    if (allowedKeys.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    if (e.key === "0" && (inputValue === null || inputValue === 0)) {
      e.preventDefault();
      return;
    }
    const currentValue = Number(inputValue ?? 0);
    const nextValue = Number(`${currentValue}${e.key}`);
    if (rest.max !== undefined && nextValue > Number(rest.max)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    setInputValue(initElement);
  }, [initElement]);

  return (
    <>
      {config ? (
        <InputNumber
          {...rest}
          minLength={rest?.minLength ? rest?.minLength : config?.minLength}
          maxLength={rest?.maxLength ? rest?.maxLength : config?.maxLength}
          className={defaultClass}
          onKeyDown={handleKeyPress}
          onChange={handleChange}
          placeholder={config?.placeHolder}
          value={inputValue}
        />
      ) : (
        <InputNumber
          {...rest}
          minLength={rest?.minLength ? rest?.minLength : config?.minLength}
          maxLength={rest?.maxLength ? rest?.maxLength : config?.maxLength}
          className={defaultClass}
          onKeyDown={handleKeyPress}
          onChange={handleChange}
          placeholder={config?.placeHolder}
          // value={inputValue}
        />
      )}
    </>
  );
};
export default CustomInputNumber;
