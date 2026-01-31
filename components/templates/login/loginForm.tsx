"use client";

import React, { FC, useState } from "react";

import { Form, FormInstance } from "antd";
import { useTranslations } from "next-intl";

import { CustomButton } from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";

interface LoginFormProps {
  isLoading?: boolean;
  onFinish: (values: { phoneNumber: string }) => void;
  form: FormInstance;
}

const LoginForm: FC<LoginFormProps> = ({ isLoading, onFinish, form }) => {
  const t = useTranslations();
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;

    rawValue = rawValue.replace(/[^\d\u06F0-\u06F9]/g, "");

    const persianToEnglishDigits = (str: string) =>
      str.replace(/[\u06F0-\u06F9]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) - 1728)
      );

    let normalized = persianToEnglishDigits(rawValue);

    // if (normalized.length > 11) {
    //   normalized = normalized.slice(0, 11);
    // }

    // if (normalized && !normalized.startsWith("09")) {
    //   normalized = "09";
    // }

    setPhoneNumber(normalized);
    form.setFieldsValue({ phoneNumber: normalized });
  };

  return (
    <Form form={form} className="w-full" onFinish={onFinish} layout="vertical">
      <Form.Item
        label={t("general.phoneNumber")}
        name="phoneNumber"
        rules={[
          { required: true, message: "شماره را وارد کنید" },
          // {
          //   pattern: /^09\d{9}$/,
          //   message: "شماره موبایل معتبر نیست (مثلاً 09123456789)",
          // },
        ]}
      >
        <InputText
          autoFocus
          placeholder={t("general.phoneNumberPlaceholder")}
          className="dark:!bg-gray-gray11 !border-none !h-10 text-gray-gray10 dark:!text-gray-gray1"
          onChange={handleChange}
          value={phoneNumber}
          maxLength={11}
          inputMode="numeric"
        />
      </Form.Item>

      <Form.Item>
        <CustomButton
          className="bg-black-black9 hover:!bg-white dark:bg-gray-gray1 !border-none w-full h-12 text-main-white hover:!text-black-black9 dark:!text-main-black transition-all"
          htmlType="submit"
          disabled={isLoading}
          loading={isLoading}
        >
          {t("general.loggingIn")}
        </CustomButton>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
