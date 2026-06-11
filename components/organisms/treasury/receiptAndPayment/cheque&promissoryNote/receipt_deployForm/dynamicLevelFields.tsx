import React from 'react';

import {
  Form,
  FormInstance,
} from 'antd';
import { useTranslations } from 'next-intl';

import { DynamicSelect } from '@components/atoms/defaultElements';
import { Level4TypeEnum } from '@components/molecules/dynamicLevelFields/enum';
import { ICondition } from '@components/molecules/dynamicLevelFields/types';

import { levelFieldMap } from './conternt';
import { useVoucherRequestConfigs } from './hooks/useVoucherRequestConfigs';

interface DynamicLevelFieldsProps {
  form: FormInstance;
  condition: ICondition;
  configs: ReturnType<typeof useVoucherRequestConfigs>;
  level4Type: Level4TypeEnum;
}

const DynamicLevelField = (props: DynamicLevelFieldsProps) => {
  const { condition, configs, form, level4Type } = props;
  const t = useTranslations();

  return (
    <>
      {levelFieldMap.map((field) => {
        if (!condition?.[field.conditionKey]) return null;
        const currentConfig = configs[field.configKey];
        return (
          <Form.Item
            key={field.name}
            label={field.label}
            name={field.name}
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col col-span-2 !mb-0 !pb-0 text-xs"
          >
            <DynamicSelect
              dynamicValue={currentConfig}
              showSearch
              allowClear
              onClear={() => form.setFieldValue(field.name, null)}
              infinite
              config={{
                name: field.name,
                caption: field.caption,
                help: "",
                placeHolder: "",
                type: "selectOption",
                selectEndpoint: currentConfig,
                setFieldValue: form.setFieldValue,
              }}
            />
          </Form.Item>
        );
      })}
    </>
  );
};

export default DynamicLevelField;
