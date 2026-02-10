"use client";
import { useEffect } from "react";

import { Checkbox, Form, FormProps } from "antd";
import { useTranslations } from "next-intl";

import {
  CustomButton,
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import { DynamicTree } from "@components/atoms/defaultElements/dynamicTree";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import InputText from "@components/atoms/defaultElements/inputText";
import type { INestedListFormConfig } from "@components/organisms/nestedList/type";
import { useCUDDataMutation, useGetData } from "@services/base";
import { getChangedFields, showSuccessToast } from "@utils/core";

import type { IProps } from "./type";

export const NestedListForm = <T, K>({
  id,
  fatherId,
  level,
  onClose,
  config,
  onGetDefault,
}: IProps<T>) => {
  const t = useTranslations();
  const {
    getUrl,
    createUrl,
    updateUrl,
    repoViewId,
    formConfig,
    uniqueKey,
    fatherKey,
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

  const formField = formConfig.filter((field) => field.type !== "group");
  const groupFormField = formConfig.filter((field) => field.type === "group");

  const renderField = (field: INestedListFormConfig, level: number) => {
    switch (field.type) {
      case "date":
        return <NewDatePicker />;
      case "selectOption": {
        const conditionalDynamicValue = field.conditionalDynamicValue
          ? field.conditionalDynamicValue(level)
          : null;
        return (
          <DynamicSelect
            dynamicValue={
              conditionalDynamicValue
                ? conditionalDynamicValue
                : field.dynamicValue
            }
            showId
            showSearch
            allowClear
            infinite
          />
        );
      }
      case "treeOption": {
        const conditionalDynamicValue = field.conditionalDynamicValue
          ? field.conditionalDynamicValue(level)
          : null;
        return (
          <DynamicTree
            dynamicValue={
              conditionalDynamicValue
                ? conditionalDynamicValue
                : field.dynamicValue
            }
            showSearch
            allowClear
          />
        );
      }
      case "number":
        return <CustomInputNumber keyboard={false} controls={false} min={0} />;

      case "price":
        return (
          <CustomInputNumber
            min={0}
            controls={false}
            parser={(value) =>
              value?.replace(/\$\s?|(,*)/g, "") as unknown as number
            }
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
          />
        );
      case "text":
        return <InputText type={field.type} />;

      default:
        return null;
    }
  };

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

  return (
    <Form
      className="p-4"
      name="NestedListForm"
      initialValues={{ remember: true }}
      layout="vertical"
      onFinish={onSubmit}
      form={form}
      autoComplete="off"
    >
      <div
        className={`lg:gap-2 lg:grid lg:grid-cols-2 lg:pb-2 flex flex-col gap-2 w-full pb-2`}
      >
        {formField
          .sort((a, b) => a.order - b.order)
          .map((field, index) => {
            const condition = field.renderConditionally
              ? field.renderConditionally(level)
              : true;

            if (!condition) return null;

            switch (field.type) {
              case "checkbox":
                return (
                  <Form.Item
                    key={index}
                    name={field.name}
                    rules={field.rules}
                    className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
                    valuePropName="checked"
                    initialValue={false}
                  >
                    <Checkbox>{field.caption}</Checkbox>
                  </Form.Item>
                );

              default:
                return (
                  <Form.Item
                    key={index}
                    label={field.caption}
                    name={field.name}
                    rules={field.rules}
                    className={`flex flex-col !mb-0 !pb-0 text-xs ${
                      formField.length % 2 !== 0 &&
                      index === formField.length - 1 &&
                      "col-span-2"
                    }`}
                  >
                    {renderField(field, level)}
                  </Form.Item>
                );
            }
          })}
      </div>

      {groupFormField?.length > 0 &&
        groupFormField
          .sort((a, b) => a.order - b.order)
          .map((field, index) => {
            const condition = field.renderConditionally
              ? field.renderConditionally(level)
              : true;

            if (!condition) return null;
            return (
              <div key={index} className="flex flex-col gap-2 text-sm">
                {field.groupItems?.map((groupItem, i) => (
                  <>
                    <span key={i}>{groupItem.title}</span>
                    <div className={`lg:flex lg:gap-4 flex flex-wrap gap-2`}>
                      {groupItem.groupFields.map((fieldItem, idx) => {
                        const condition = fieldItem.renderConditionally
                          ? fieldItem.renderConditionally(level)
                          : true;
                        if (!condition) return null;
                        return fieldItem.type === "checkbox" ? (
                          <Form.Item
                            key={fieldItem.name}
                            name={fieldItem.name}
                            rules={fieldItem.rules}
                            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
                            valuePropName="checked"
                            initialValue={false}
                          >
                            <Checkbox>{fieldItem.caption}</Checkbox>
                          </Form.Item>
                        ) : (
                          <Form.Item
                            key={fieldItem.name}
                            label={fieldItem.caption}
                            name={fieldItem.name}
                            rules={fieldItem.rules}
                            className={`flex flex-col !mb-0 !pb-0 text-xs ${
                              groupItem.groupFields.length % 2 !== 0 &&
                              idx === groupItem.groupFields.length - 1 &&
                              "col-span-2"
                            }`}
                          >
                            {renderField(fieldItem, level)}
                          </Form.Item>
                        );
                      })}
                    </div>
                  </>
                ))}
              </div>
            );
          })}

      <Form.Item className="m-0 p-0 pt-2 text-xs">
        <div
          className={`lg:flex lg:justify-end lg:items-center lg:gap-2 grid grid-cols-1  w-full text-xs`}
        >
          <CustomButton
            htmlType="submit"
            type="text"
            loading={isLoading}
            className="flex gap-2 bg-black-black8 hover:bg-white px-3 py-1 border hover:border-black-black8 rounded min-w-[76px] text-white hover:text-black-black8 text-xs"
          >
            {t("general.submit")}
          </CustomButton>
        </div>
      </Form.Item>
    </Form>
  );
};
