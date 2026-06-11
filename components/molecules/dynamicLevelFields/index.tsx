"use client";
import React, { useEffect } from 'react';

// DynamicLevelFields.tsx
import {
  Form,
  FormInstance,
} from 'antd';
import { useTranslations } from 'next-intl';
import { useDispatch } from 'react-redux';

import {
  CustomSpin,
  DynamicSelect,
} from '@components/atoms/defaultElements';
import { setPageData } from '@slice/pages';

import { levelFieldMap } from './conternt';
import { Level4TypeEnum } from './enum';
import {
  useAccountCondition,
} from './hooks/useAccountCondition'; // هوکی که قبلا ساختیم
import { useVoucherLevelConfigs } from './hooks/useVoucherLevelConfigs';

interface DynamicLevelFieldsProps {
  form: FormInstance;
  accountId: number | null;
  level4Type?: Level4TypeEnum;
  className?: string;
  withConfig?: boolean;
  VoucherTypeId?: number;
  url?: string;
}

const DynamicLevelFields = (props: DynamicLevelFieldsProps) => {
  const {
    form,
    accountId,
    level4Type,
    className = "col-span-2",
    withConfig = true,
    VoucherTypeId,
    url,
  } = props;
  const t = useTranslations();
  const dispatch = useDispatch();
  const { condition, isLoading } = useAccountCondition({ accountId, url });
  const configs = useVoucherLevelConfigs(accountId, level4Type, VoucherTypeId);
  const fields = levelFieldMap({ level4Type, voucherTypeId: VoucherTypeId });

  useEffect(() => {
    form.setFieldValue("TafsiliId", null);
    dispatch(
      setPageData({
        name: "TafsiliId",
        value: undefined,
      }),
    );
  }, [VoucherTypeId,level4Type]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center w-full">
        <CustomSpin />
      </div>
    );

  if (!accountId || !condition) return null;

  return (
    <>
      {fields.map((field) => {
        if (!condition[field.conditionKey as keyof typeof condition])
          return null;
        const currentConfig =
          configs[`${field.configKey}` as keyof typeof configs];
        return (
          <Form.Item
            key={`${accountId}-${field.name}`}
            label={field.label}
            name={field.name}
            preserve={false}
            rules={[{ required: true, message: t("form.required") }]}
            className={`flex flex-col !mb-0 !pb-0 text-xs ${className}`}
          >
            <DynamicSelect
              dynamicValue={currentConfig}
              showSearch
              allowClear
              selectFirstDefault={false}
              onClear={() => form.setFieldValue(field.name, null)}
              infinite
              {...(withConfig && {
                config: {
                  name: field.name,
                  caption: field.caption,
                  type: "selectOption",
                  selectEndpoint: currentConfig,
                  setFieldValue: form.setFieldValue,
                },
              })}
            />
          </Form.Item>
        );
      })}
    </>
  );
};

export default DynamicLevelFields;
