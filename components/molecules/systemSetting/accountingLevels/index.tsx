import { useEffect, useRef } from "react";

import { Form, Select, Spin } from "antd";
import { useTranslations } from "next-intl";

import { CustomButton } from "@components/atoms/defaultElements";
import { SpinIcon } from "@components/atoms/iconComponents";
import { useCUDDataMutation, useGetData } from "@services/base";
import { showSuccessToast } from "@utils/core";

export const AccountingLevels = () => {
  const t = useTranslations();
  const [form] = Form.useForm();

  const { data: defaultValue } = useGetData<any, null>({
    url: "api/mng/select/placeConfigValue",
    body: {},
  });

  const initialValuesRef = useRef<any>(null);

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
          url: "api/mng/update/placeConfigValue",
          body: {
            ...values,
            ChangeFields: changedFields,
            PlaceConfigValueId: defaultValue.Data[0].PlaceConfigValueId,
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
      form.setFieldsValue({
        AccLevel: defaultValue.Data[0].AccLevel,
      });
      initialValuesRef.current = defaultValue.Data[0];
    }
  }, [defaultValue]);

  return (
    <Form
      form={form}
      name="accountingLevels"
      onFinish={handleSubmit}
      layout="vertical"
      className="flex flex-col gap-2"
    >
      <div className="flex flex-col gap-2">
        <Form.Item
          label="تعداد سطوح حسابداری"
          name="AccLevel"
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <Select
            className="bg-gray-gray3 rounded"
            placeholder="تعداد سطوح"
            options={Array.from({ length: 10 }, (_, i) => {
              const value = i + 4;
              return {
                label: value,
                value: value,
              };
            })}
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
