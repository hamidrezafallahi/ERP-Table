"use client";
import React, {
  ChangeEvent,
  useState,
} from 'react';

import {
  Form,
  FormInstance,
  Input,
} from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  InputPassword,
} from '@components/atoms/defaultElements';
import { Circle } from '@components/atoms/iconComponents';

const validatePasswordRules = (password: string) => {
  return {
    minLength: password?.length >= 8,
    hasNumber: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>_\-\\/[\]=+؛،<>~]/.test(password),
  };
};

interface NewPassWordProps {
  isLoading?: boolean;
  onFinish: (values: { newPassword: string; confirmPassword?: string }) => void;
  form: FormInstance;
}

const NewPassWord: React.FC<NewPassWordProps> = ({
  isLoading,
  onFinish,
  form,
}) => {
  const t = useTranslations();
  const [password, setPassword] = useState<string>("");
  const [showPasswordRules, setShowPasswordRules] = useState<boolean>(false);

  const passwordRules = validatePasswordRules(password);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  return (
    <Form
      form={form}
      name="NewPasswordForm"
      layout="vertical"
      className="relative w-full"
      onFinish={onFinish}
    >
      <Form.Item
        label={
          <span className="!text-gray-gray10 dark:!text-gray-gray1">
            {t("general.newPassWord")}
          </span>
        }
        name="newPassword"
        rules={[{ required: true, message: t("general.passwordRequired") }]}
      >
        <div className="relative">
          <Input
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => setShowPasswordRules(true)}
            onBlur={() => setTimeout(() => setShowPasswordRules(false), 100)}
            className="dark:!bg-gray-gray11 border-none !h-10 text-gray-gray10 dark:!text-gray-gray1"
          />

          {showPasswordRules && (
            <div
              className="top-1/2 -left-[300px] z-50 absolute space-y-6 bg-gray-gray1 shadow-lg p-7 rounded-xl w-[275px] h-[194px] text-sm text-right -translate-y-1/2"
              dir="rtl"
            >
              <div className="flex items-center text-gray-gray7">
                <span className="ml-2">
                  <Circle
                    config={{
                      fill: passwordRules.minLength ? "#3ED060" : "#D1D5DB",
                    }}
                  />
                </span>
                حداقل ۸ کاراکتر طول داشته باشد
              </div>

              <div className="flex items-center text-gray-gray7">
                <span className="ml-2">
                  <Circle
                    config={{
                      fill: passwordRules.hasNumber ? "#3ED060" : "#D1D5DB",
                    }}
                  />
                </span>
                شامل حداقل یک عدد (۰-۹) باشد
              </div>

              <div className="flex items-center text-gray-gray7">
                <span className="ml-2">
                  <Circle
                    config={{
                      fill: passwordRules.hasSpecialChar
                        ? "#3ED060"
                        : "#D1D5DB",
                    }}
                  />
                </span>
                شامل حداقل یک نماد خاص (@، #، $ ...) باشد
              </div>
            </div>
          )}
        </div>
      </Form.Item>

      <Form.Item
        label={
          <span className="!text-gray-gray10 dark:!text-gray-gray1">
            {t("general.repeatPassWord")}
          </span>
        }
        name="confirmPassword"
        dependencies={["newPassword"]}
        rules={[
          { required: true, message: t("general.passwordRequired") },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error(
                  t("general.passwordsNotMatch") ||
                    "رمز عبور‌ها با هم مطابقت ندارند"
                )
              );
            },
          }),
        ]}
      >
        <InputPassword
          placeholder="**********"
          className="dark:!bg-gray-gray11 border-none !h-10 text-gray-gray10 dark:!text-gray-gray1"
        />
      </Form.Item>

      <Form.Item>
        <CustomButton
          className="bg-black-black9 hover:!bg-white dark:bg-gray-gray1 !border-none w-full h-12 text-main-white hover:!text-black-black9 dark:!text-main-black"
          htmlType="submit"
          loading={isLoading}
        >
          {t("general.acceptAndContinue")}
        </CustomButton>
      </Form.Item>
    </Form>
  );
};

export default NewPassWord;
