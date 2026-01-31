"use client";

import React, {
  FC,
  useState,
} from 'react';

import {
  Form,
  FormInstance,
} from 'antd';
import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import { CloseModalIcon } from '@components/atoms/iconComponents';

interface ForgetProps {
  isLoading?: boolean;
  onFinish: (values: { phoneNumber: string }) => void;
  form: FormInstance;
  onClose?: () => void;
}

const Forget: FC<ForgetProps> = ({ isLoading, onFinish, form, onClose }) => {
  const t = useTranslations();
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;
    rawValue = rawValue.replace(/[^\d\u06F0-\u06F9]/g, "");

    const persianToEnglishDigits = (str: string) =>
      str.replace(/[\u06F0-\u06F9]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) - 1728)
      );

    const normalized = persianToEnglishDigits(rawValue);
    setPhoneNumber(normalized);
    form.setFieldsValue({ phoneNumber: normalized });
  };

  return (
    <>
      <div className="top-4 right-4 absolute cursor-pointer" onClick={onClose}>
        <CloseModalIcon />
      </div>

      <Form
        form={form}
        className="w-full"
        onFinish={onFinish}
        layout="vertical"
      >
        <div className="flex justify-center pb-4 w-full font-medium text-gray-gray9 text-xl">
          {t("general.forgotPassword")}
        </div>

        <p className="flex justify-center pb-10 w-full font-medium text-gray-gray85">
          برای بازیابی رمز عبور، نام کاربری خود را وارد کنید.
        </p>

        <Form.Item
          name="phoneNumber"
          rules={[{ required: true, message: "شماره را وارد کنید" }]}
        >
          <InputText
            autoFocus
            placeholder={t("general.enterYourUsername")}
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
            {t("general.resetForgetPass")}
          </CustomButton>
        </Form.Item>
      </Form>
    </>
  );
};

export default Forget;
