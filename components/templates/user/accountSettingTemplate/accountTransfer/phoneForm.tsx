import React from 'react';

import { Form } from 'antd';

import { CustomButton } from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';

import usePhoneInput from './usePhoneInput';
import { useTranslations } from 'next-intl';

export default function PhoneForm({
  phoneHook,
  onSearch,
  submitLabel,
  disabled,
  direction,
}: {
  phoneHook: ReturnType<typeof usePhoneInput>;
  onSearch: () => void;
  submitLabel?: React.ReactNode;
  disabled?: boolean;
  direction?: string;
}) {

    const t = useTranslations();
  return (
    <div className="relative w-full">
      <div className="block relative md:flex md:gap-4 w-full sm:w-[578px] sm:h-16">
        <Form onFinish={onSearch} className="w-full sm:w-[495px]">
          <Form.Item
            layout="vertical"
            className="w-full"
            label={t("general.destinationAccountPhoneNumber")}
            name="phone"
            rules={[
              { required: true, message: t("general.enterPhoneNumber")},
              {
                pattern: /^\d{11}$/,
                message: t("general.thePhoneNumberMustBeExactly11Digits"),
              },
            ]}
          >
            <InputText
              value={phoneHook.value}
              onChange={(e) => phoneHook.setValue(e.target.value)}
              onKeyDown={phoneHook.handleKeyDown}
              onBeforeInput={phoneHook.handleBeforeInput}
              onPaste={phoneHook.handlePaste}
              inputMode="numeric"
              autoComplete="tel"
              pattern="\d*"
              maxLength={11}
              className="!h-14 sm:!h-9"
            />
            <p className="mt-2 text-blue-blue5 text-xs text-center sm:text-right">
            {t("general.toTransferFundsEnterTheRecipientsMobileNumberInThisField")}
            </p>
          </Form.Item>
        </Form>

        <div
          className={` ${
            direction == "rtl" ? "sm:left-[0px]" : "sm:right-0"
          } sm:-bottom-1  sm:absolute`}
        >
          <CustomButton
            type="text"
            htmlType="submit"
            onClick={onSearch}
            disabled={!!disabled}
            className="bg-main-black disabled:bg-gray-gray55 dark:disabled:bg-gray-gray11 w-full sm:w-16 h-9 text-white disabled:text-gray-gray8 text-xs disabled:cursor-not-allowed"
          >
            {submitLabel ?? t("general.search")}
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
