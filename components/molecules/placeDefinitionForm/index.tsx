"use client";
import {
  ClipboardEvent,
  KeyboardEvent,
  useEffect,
  useState,
} from 'react';

import {
  Form,
  FormProps,
  Radio,
} from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import type { INestedListConfig } from '@components/organisms/nestedList/types';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import { getChangedFields } from '@utils/core';
import { showSuccessToast } from '@utils/toast';

interface PlaceDefinitionFormProps<T> {
  config: INestedListConfig;
  fatherId: number | null;
  id: number | null;
  level: number;
  onClose: () => void;
  onGetDefault?: (e) => void;
}

const onlyNumbers = (e: KeyboardEvent<HTMLInputElement>) => {
  if (!/[0-9]/.test(e.key)) e.preventDefault();
};

const onlyNumbersPaste = (e: ClipboardEvent<HTMLInputElement>) => {
  const paste = e.clipboardData.getData("text");
  if (!/^\d*$/.test(paste)) e.preventDefault();
};

const onlyLetters = (e: KeyboardEvent<HTMLInputElement>) => {
  if (!/^[A-Za-z\u0600-\u06FF\s]$/.test(e.key)) e.preventDefault();
};

const onlyLettersPaste = (e: ClipboardEvent<HTMLInputElement>) => {
  const paste = e.clipboardData.getData("text");
  if (!/^[A-Za-z\u0600-\u06FF\s]*$/.test(paste)) e.preventDefault();
};

export const PlaceDefinitionForm = <T, K>({
  id,
  fatherId,
  onClose,
  config,
  onGetDefault,
}: PlaceDefinitionFormProps<T>) => {
  const t = useTranslations();

  const {
    getUrl,
    createUrl,
    updateUrl,
    repoViewId,
    uniqueKey,
    fatherKey,
    staticCondition,
    staticValues,
  } = config;

  const { data, isSuccess: defaultValueSuccess } = useGetData<T[], K>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      Id: id,
    },
    skip: !id,
  });

  const [trigger, { isLoading }] = useCUDDataMutation();

  const [form] = Form.useForm();

  const defaultValue: T = data?.Data[0];

  useEffect(() => {
    if (form && defaultValueSuccess && data.Data.length > 0) {
      form?.setFieldsValue(defaultValue);
      onGetDefault?.(defaultValue);
    }
    return () => form?.resetFields();
  }, [defaultValue, data, form, defaultValueSuccess]);

  useEffect(() => {
    if (config?.staticCondition && config?.staticCondition(id, fatherId)) {
      form?.setFieldsValue(config?.staticValues);
    }
  }, [fatherId, id, config?.staticCondition]);

  const [IsBranch, setIsBranch] = useState<boolean>(true);

  const onSubmit: FormProps<any>["onFinish"] = async (values) => {
    const changedFields = id ? getChangedFields(defaultValue, values) : [];

    try {
      const triggerFormResponse = await trigger({
        url: id ? updateUrl : createUrl,
        body: id
          ? { ...values, [uniqueKey]: id, ChangeFields: changedFields }
          : { ...values, [fatherKey]: fatherId },
      }).unwrap();

      if (triggerFormResponse?.Result !== "Failed") {
        showSuccessToast(t("toast.save"));
        form.resetFields();
        onClose();
      }
    } catch (error) {
      null;
    }
  };
  useEffect(() => {
    if (defaultValueSuccess && data?.Data?.length)
      form.setFieldsValue(defaultValue);
    return () => form.resetFields();
  }, [defaultValue, data, defaultValueSuccess, form]);

  useEffect(() => {
    if (staticCondition?.(id, fatherId)) {
      form.setFieldsValue(staticValues);
    }
  }, [fatherId, id, staticCondition, staticValues, form]);

  const inputProps = {
    onKeyPress: onlyNumbers,
    onPaste: onlyNumbersPaste,
  };

  const letterInputProps = {
    onKeyPress: onlyLetters,
    onPaste: onlyLettersPaste,
  };
  const RegisterDate = Form.useWatch("RegisterDate", form);
  return (
    <Form
      form={form}
      name={t("general.companyForm")}
      initialValues={{ remember: true }}
      onFinish={onSubmit}
      layout="vertical"
      className={`p-6 lg:w-[564px] max-h-[calc(100dvh-160px)] h-auto overflow-y-auto hidden-show-scrollBar`}
    >
      <Form.Item
        label={t("general.isBranch")}
        name="IsBranch"
        className="flex flex-row text-xs"
      >
        <Radio.Group
          className="flex gap-16"
          value={IsBranch}
          onChange={(e) => setIsBranch(e.target.value)}
        >
          <Radio value={true}>{t("general.independent")}</Radio>
          <Radio value={false}>{t("general.branch")}</Radio>
        </Radio.Group>
      </Form.Item>

      {/* Company Info */}
      <Form.Item
        label={t("general.companyCode")}
        name="PlaceCode"
        className="flex flex-col text-xs"
        rules={[
          { required: true, message: t("form.required") },
          { pattern: /^\d{1,8}$/ },
        ]}
      >
        <InputText maxLength={8} {...inputProps} />
      </Form.Item>

      <Form.Item
        label={t("general.companyName")}
        name="PlaceDesc"
        className="flex flex-col text-xs"
        rules={[
          { required: true, message: t("form.required") },
          {
            pattern: /^[A-Za-z\u0600-\u06FF\s]{1,20}$/,
          },
        ]}
      >
        <InputText maxLength={20} {...letterInputProps} />
      </Form.Item>

      {/* Two-column fields */}
      <div className="gap-x-6 grid grid-cols-1 md:grid-cols-2">
        <Form.Item
          label={t("general.displayNameOnInvoice")}
          name="PlaceShortCut"
          className="flex flex-col text-xs"
          rules={[
            { required: true, message: t("form.required") },
            { pattern: /^[A-Za-z\u0600-\u06FF\s]{1,20}$/ },
          ]}
        >
          <InputText maxLength={20} {...letterInputProps} />
        </Form.Item>

        <Form.Item
          name="PlaceAddress"
          label={t("general.address")}
          className="flex flex-col text-xs"
          rules={[{ required: true, message: t("form.required") }]}
        >
          <InputText />
        </Form.Item>

        {IsBranch && (
          <>
            <Form.Item
              label={t("general.nationalID")}
              name="NationalIdentity"
              className="flex flex-col text-xs"
              rules={[
                { required: true, message: t("form.required") },
                { pattern: /^\d{10}$/ },
              ]}
            >
              <InputText maxLength={10} {...inputProps} />
            </Form.Item>

            <Form.Item
              label={t("general.registrationDate")}
              name="RegisterDate"
              className="flex flex-col text-xs"
            >
              <NewDatePicker defaultValue={RegisterDate} />
            </Form.Item>

            <Form.Item
              label={t("general.registrationNumber")}
              name="RegisterNum"
              className="flex flex-col text-xs"
              rules={[{ pattern: /^\d{10}$/ }]}
            >
              <InputText maxLength={10} {...inputProps} />
            </Form.Item>

            <Form.Item
              label={t("general.taxCode")}
              name="CommercialCode"
              className="flex flex-col text-xs"
              rules={[{ pattern: /^\d+$/ }]}
            >
              <InputText maxLength={10} {...inputProps} />
            </Form.Item>
          </>
        )}

        <Form.Item
          label={t("general.contactNumber")}
          name="PlacePhone"
          className="flex flex-col text-xs"
          rules={[
            { required: true, message: t("form.required") },
            { pattern: /^09\d{9}$/ },
          ]}
        >
          <InputText maxLength={11} {...inputProps} />
        </Form.Item>

        <Form.Item
          label={t("general.postalCode")}
          name="PostalCode"
          className="flex flex-col text-xs"
          rules={[{ pattern: /^\d+$/ }]}
        >
          <InputText maxLength={10} {...inputProps} />
        </Form.Item>
      </div>

      <Form.Item className="mt-3 p-0 text-xs">
        <div
          className={`lg:flex lg:justify-end lg:items-center lg:gap-2 grid grid-cols-1 bg-white  dark:bg-gray-gray12 h-20 border-t  p-7  border-t-gray-gray8 w-full text-xs fixed left-0 right-0 bottom-0`}
        >
          <CustomButton
            htmlType="submit"
            type="text"
            loading={isLoading}
            className="bg-black-black8 hover:bg-white dark:!bg-gray-gray10 px-3 py-1 border hover:border-black-black8 rounded min-w-[76px] text-white hover:text-black-black8 text-xs"
          >
            {t("general.submit")}
          </CustomButton>
        </div>
      </Form.Item>
    </Form>
  );
};
