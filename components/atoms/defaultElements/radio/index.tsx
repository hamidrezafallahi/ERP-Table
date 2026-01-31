import { Radio } from "antd";

import type { IProps } from "./type";

export const CustomRadio = ({ ...rest }: IProps) => {
  const { value, children } = rest;
  return (
    <Radio value={value} {...rest}>
      {children}
    </Radio>
  );
};

// import  { useCallback, useState } from "react";
// import { Radio, RadioChangeEvent } from "antd";
// import { CheckboxOptionType } from "antd/lib";
// import { RadioButtonProps } from "antd/es/radio/radioButton";
// import AppReduxStore from "@redux/index";
// import { setPageData } from "@slice/Forms";

// export interface IRadio extends RadioButtonProps {
//   options?:Array<CheckboxOptionType>
//   isNeedStore?:boolean
// }

// const Index = ({
//   isNeedStore = true,
//   ...rest
// }: IRadio) => {
//     const {className,name,options,onChange}=rest
//     const defaultClass = `w-full flex justify-start${className} `
//   const radioChanges = useCallback((e: RadioChangeEvent) => {
//     onChange?.(e);
//     if(isNeedStore){
//       AppReduxStore.dispatch(setPageData({ fieldName: e.target.name, type: "string", value: e.target.value }));
//     }
//   }, [onChange]);

//   return (
//       <Radio.Group
//         name={name}
//         options={options}
//         className={defaultClass}
//         defaultValue={options.find(item => item.default)?.value}
//         onChange={radioChanges}
//       />
//   );
// };

// export default Index;
