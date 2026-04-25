"use client";

import { FC } from "react";
import { Form } from "antd";
import { CustomButton, NewDatePicker } from "@components/atoms/defaultElements";
import { ToolbarInfoProps } from "./type";
import { useTranslations } from "next-intl";

export const HeaderInfo: FC<ToolbarInfoProps> = ({
  fromFieldName = "FromDate",
  toFieldName = "ToDate",
  onChange,
  isLoading,
}) => {
  const [form] = Form.useForm();
  const t = useTranslations();

  const handleValuesChange = () => {
    const from = form.getFieldValue(fromFieldName);
    const to = form.getFieldValue(toFieldName);
    if (!from || !to) return;

    onChange(from, to);
  };

  return (
    <Form
      layout="vertical"
      form={form}
      onFinish={handleValuesChange}
      className="grid grid-cols-3 gap-4 "
    >
      <Form.Item label={t("general.startDate")} name={fromFieldName} required>
        <NewDatePicker
          config={{
            name: fromFieldName,
            type: "date",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      <Form.Item label={t("general.endDate")} name={toFieldName} required>
        <NewDatePicker
          config={{
            name: toFieldName,
            type: "date",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      <CustomButton
        htmlType="submit"
        type="text"
        loading={isLoading}
        className="bg-black-black8 hover:bg-white dark:!bg-gray-gray10 px-3 py-1 border w-24 mt-8 hover:border-black-black8 rounded min-w-[76px] text-white hover:text-black-black8 text-xs"
      >
        {t("general.search")}
      </CustomButton>
    </Form>
  );
};
