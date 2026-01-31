import { SelectProps } from 'antd';

import type { IFormFieldConfig } from '@type/elementType';

import RadioList from '../radioList';

export default function DynamicRadio({
  item,
  config,
  disabled = false,
  ...rest
}: {
  item: IFormFieldConfig;
  config?: IFormFieldConfig;
  className?: string;
  disabled?: boolean;
}) {
  const options:SelectProps["options"] = item?.radioValues?.map((item) => {
    return {
      label: item.caption,
      value: item.value,
      name: config.name,
    };
  });
  return (
    <>
      <RadioList
        {...rest}
        options={options ?? []}
        disabled={disabled}
        config={{
          name: config?.name,
          caption: item?.caption,
          help: item?.help,
          order: item?.order,
          placeHolder: item?.placeHolder,
          rules: item?.rules,
          type: item?.type,
          setFieldValue: config?.setFieldValue,
        }}
      />
    </>
  );
}
