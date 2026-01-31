import React from 'react';

import {
  Form,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';

export default function PhoneSearch({
  value,
  setValue,
  loading,
  onSearch,
  direction,
}: {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  onSearch: () => void;
  className?: string;
  direction?: string;
}) {
  const t = useTranslations();

  const onlyDigits = (v: string) => v.replace(/\D+/g, "");
  const phoneIsValid = /^\d{11}$/.test(value);

  const handlePhoneChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(onlyDigits(e.target.value));
  };

  const handlePhoneKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    e
  ) => {
    const allowedCtrlCmd =
      (e.ctrlKey || e.metaKey) &&
      ["a", "c", "v", "x"].includes(e.key.toLowerCase());
    const navigationKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Tab",
    ];
    if (allowedCtrlCmd || navigationKeys.includes(e.key) || /^\d$/.test(e.key))
      return;
    e.preventDefault();
  };

  const handlePhoneBeforeInput: React.FormEventHandler<HTMLInputElement> = (
    e: any
  ) => {
    const data = e?.nativeEvent?.data as string | undefined;
    if (data && /\D/.test(data)) e.preventDefault();
  };

  const handlePhonePaste: React.ClipboardEventHandler<HTMLInputElement> = (
    e
  ) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text");
    const digits = onlyDigits(text);
    setValue((prev) => (prev ? onlyDigits(prev + digits) : digits));
  };

  return (
    <div className={`relative w-full flex gap-4`}>
      <div className="block relative md:flex md:gap-4 w-full sm:w-[578px] sm:h-16">
        <Form onFinish={onSearch} className="w-full sm:max-w-[495px]">
          <Form.Item
            layout="vertical"
            className="w-full"
            label="شماره تلفن کاربر"
            name="phone"
            rules={[
              { required: true, message: "شماره تلفن را وارد کنید" },
              {
                pattern: /^\d{11}$/,
                message: "شماره تلفن باید دقیقاً ۱۱ رقم باشد",
              },
            ]}
          >
            <InputText
              className="!h-14 sm:!h-9"
              value={value}
              onChange={handlePhoneChange}
              onKeyDown={handlePhoneKeyDown}
              onBeforeInput={handlePhoneBeforeInput}
              onPaste={handlePhonePaste}
              inputMode="numeric"
              autoComplete="tel"
              pattern="\d*"
              maxLength={11}
            />
            <p className="mt-2 text-blue-blue5 text-xs">
              «جهت انتقال شرکت، شماره همراه دریافت‌کننده را در این قسمت وارد
              کنید.»
            </p>
          </Form.Item>
        </Form>

        <div
          className={` sm:-bottom-1  sm:absolute   ${
            direction == "rtl" ? "sm:left-0" : "sm:right-0"
          }   `}
        >
          <CustomButton
            type="text"
            htmlType="submit"
            onClick={onSearch}
            disabled={!phoneIsValid || loading}
            className="bg-main-black disabled:bg-gray-gray55 dark:disabled:bg-gray-gray11 w-full sm:w-16 h-9 text-white disabled:text-gray-gray8 text-xs disabled:cursor-not-allowed"
          >
            {loading ? <Spin size="small" /> : t("general.search")}
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
