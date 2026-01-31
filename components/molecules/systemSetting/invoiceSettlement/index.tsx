import { useEffect, useRef } from "react";

import { Form, Spin } from "antd";
import { useTranslations } from "next-intl";

import { CustomButton, DynamicSelect } from "@components/atoms/defaultElements";
import { SpinIcon } from "@components/atoms/iconComponents";
import { useCUDDataMutation, useGetData } from "@services/base";
import type { IRequestConfig } from "@type/elementType";
import { showSuccessToast } from "@utils/core";

export const InvoiceSettlement = () => {
  const t = useTranslations();
  const [form] = Form.useForm();
  const initialValuesRef = useRef<any>(null);

  const rpWayConfig: IRequestConfig = {
    addWebUrl: "api/trh/select/rpWay4voucher",
    endpoint: "api/trh/select/rpWay4voucher",
    repoViewId: null,
  };

  const { data: defaultValue } = useGetData<any, null>({
    url: "api/sale/select/setting",
    body: {
      RepoViewId: 130075,

      ShowBookmarked: true,
      ShowTags: true,
    },
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const handleSubmit = async (values) => {
    try {
      const changedFields: string[] = [];

      Object.keys(values).forEach((key) => {
        if (values[key] !== initialValuesRef.current?.[key]) {
          changedFields.push(key);
        }
      });

      if (changedFields.length > 0) {
        const mutateResult = await mutateItem({
          url: "api/sale/update/setting",
          body: {
            ChangeFields: changedFields,
          },
        }).unwrap();

        if (mutateResult?.Result === "Success") {
          showSuccessToast(t("toast.successTitle"));
        }
      }
    } catch (error) {
      null;
    }
  };

  useEffect(() => {
    if (defaultValue?.Data?.[0]) {
      const data = defaultValue.Data[0];
      form.setFieldsValue(data);
      initialValuesRef.current = data;
    }
  }, [defaultValue]);

  return (
    <Form
      form={form}
      name="invoiceSettlement"
      onFinish={handleSubmit}
      layout="vertical"
      className="flex flex-col gap-2"
    >
      <div className="flex flex-col gap-2">
        <span>◂{t("systemSetting.cheque")}</span>

        <Form.Item
          label="نحوه"
          name="2"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={rpWayConfig}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("2", null)}
            infinite
          />
        </Form.Item>
      </div>

      <div className="flex flex-col gap-2">
        <span>◂{t("systemSetting.cash")}</span>

        <Form.Item
          label="نحوه"
          name="0"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={rpWayConfig}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("0", null)}
            infinite
          />
        </Form.Item>
      </div>

      <div className="flex flex-col gap-2">
        <span>◂{t("systemSetting.bank")}</span>
        <Form.Item
          label="نحوه"
          name="1"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={rpWayConfig}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("1", null)}
            infinite
          />
        </Form.Item>
      </div>

      <Form.Item className="col-span-2 m-0 p-0 text-xs">
        <div className="flex justify-end items-center gap-2 pt-2">
          <CustomButton
            type="text"
            htmlType="submit"
            className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
          >
            {mutateIsLoading ? (
              <Spin size="large" indicator={<SpinIcon />} />
            ) : (
              t("general.submit")
            )}
          </CustomButton>
        </div>
      </Form.Item>
    </Form>
  );
};
