"use client";
import { Form } from 'antd';
import { FormInstance } from 'antd/lib';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  InputPassword,
} from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';

interface PasswordLoginFormProps {
  form: FormInstance;
  isLoading: boolean;
  handlePasswordLogin: (values: { password: string }) => void;
  onForgetClick: () => void;
}

export default function PasswordLoginForm({
  form,
  isLoading,
  handlePasswordLogin,
  onForgetClick,
}: PasswordLoginFormProps) {
  const t = useTranslations();
  const handleForgetPassword = () => {
    onForgetClick();
  };

  return (
    <>
      <Form
        form={form}
        name="PasswordLogin"
        layout="vertical"
        onFinish={handlePasswordLogin}
        className="w-full"
      >
        <Form.Item
          label={
            <span className="!text-gray-gray10 dark:!text-gray-gray1">
              {t("general.password")}
            </span>
          }
          name="password"
          rules={[{ required: true, message: t("general.passwordRequired") }]}
        >
          <InputPassword
            autoFocus
            placeholder="**********"
            className="dark:!bg-gray-gray11 border-none !h-10 text-gray-gray10 dark:!text-gray-gray1"
          />
        </Form.Item>

        <div className="flex justify-between items-center mb-4 py-5 text-gray-gray9">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <CustomCheckbox className="font-normal text-gray-gray9 text-sm">
              {t("general.rememberPassword")}
            </CustomCheckbox>
          </Form.Item>

          <button
            type="button"
            className="font-normal text-sm hover:underline"
            onClick={handleForgetPassword}
          >
            {t("general.forgotPassword")}
          </button>
        </div>

        <Form.Item>
          <CustomButton
            className="bg-black-black9 hover:!bg-white dark:bg-gray-gray1 !border-none w-full h-12 text-main-white hover:!text-black-black9 dark:!text-main-black"
            htmlType="submit"
            disabled={isLoading}
            loading={isLoading}
          >
            {t("general.loggingIn")}
          </CustomButton>
        </Form.Item>
      </Form>
    </>
  );
}
