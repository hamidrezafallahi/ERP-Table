import { useEffect, useState } from "react";

import { Radio } from "antd";
import { RadioButtonProps } from "antd/es/radio/radioButton";
import { RadioChangeEvent } from "antd/lib";
import { useDispatch } from "react-redux";

import { CustomRadio } from "@components/atoms/defaultElements";
import { useAppSelector } from "@redux/index";
import { setPageData } from "@slice/pages";

import type { IProps } from "./type";

function RadioList({ ...props }: IProps) {
  const { className, onChange, options, config, value } = props;
  const dispatch = useDispatch();
  const initElement = useAppSelector((state) => {
    if (config) {
      const { name } = config;
      return (
        state.withPersist.pages
          .find((item) => item.isActive)
          ?.pageData?.find((element) => element.name === name)?.value ?? null
      );
    }
    return null;
  });

  useEffect(() => {
    if (config) {
      const { name, setFieldValue } = config;
      if (setFieldValue) {
        setFieldValue(name, initElement);
      }
    }
  }, [initElement, config]);

  const [init, setInit] = useState(initElement);
  useEffect(() => {
    setInit(initElement);
  }, [initElement]);
  useEffect(() => {
    setInit(value);
  }, [value]);

  const defaultClass = `w-full flex gap-4 flex-wrap ${className} `;
  const radioChanges = (e: RadioChangeEvent) => {
    const value = e.target.value;
    setInit(value);
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
          value: value,
        }),
      );
    }
  };
  if (config) {
    return (
      <Radio.Group
        {...(props as RadioButtonProps)}
        className={defaultClass}
        name={config?.name}
        onChange={radioChanges}
        value={init}
      >
        {options.map((option, index) => (
          <CustomRadio {...props} key={index} value={option.value}>
            {option.label}
          </CustomRadio>
        ))}
      </Radio.Group>
    );
  } else {
    return (
      <Radio.Group
        {...(props as RadioButtonProps)}
        className={defaultClass}
        onChange={radioChanges}
      >
        {options.map((option, index) => (
          <CustomRadio {...props} key={index} value={option.value}>
            {option.label}
          </CustomRadio>
        ))}
      </Radio.Group>
    );
  }
}

export default RadioList;
