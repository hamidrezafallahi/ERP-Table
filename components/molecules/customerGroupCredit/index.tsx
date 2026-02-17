import { useEffect, useRef } from "react";

import { Form, Spin } from "antd";
import { useTranslations } from "next-intl";

import {
  CustomButton,
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import { SpinIcon } from "@components/atoms/iconComponents";
import { useCUDDataMutation, useGetData } from "@services/base";

import type {
  ICustomerGroup,
  IRequest,
} from "@services/sale/customerGroup/type";
import { showSuccessToast } from "@utils/core";

export const CustomerGroupCredit = ({ handleClose, sourceKey, id }) => {
  const { data: defaultValue } = useGetData<ICustomerGroup[], IRequest>({
    url: "api/sale/select/customerGroup",
    body: {
      RepoViewId: 130018,
      Id: id,
    },
    skip: !id,
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();
  const t = useTranslations();
  const [form] = Form.useForm();

  const initialValuesRef = useRef<any>(null);

  const handleSubmit = async (values) => {
    try {
      if (!id) return;

      const changedFields: string[] = [];

      Object.keys(values).forEach((key) => {
        if (values[key] !== initialValuesRef.current?.[key]) {
          changedFields.push(key);
        }
      });

      if (changedFields.length > 0) {
        const mutateResult = await mutateItem({
          url: "/api/sale/update/customerGroup/credit",
          body: {
            ...values,
            [sourceKey]: id,
            RepoViewId: 130018,
            ChangeFields: changedFields,
          },
        }).unwrap();

        if (mutateResult?.Result === "Success") {
          showSuccessToast(t("toast.successTitle"));
        }
      }

      handleClose();
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
      name="customerGroupCredit"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col lg:grid lg:grid-cols-2 gap-2 p-4`}
    >
      <Form.Item
        label="مبلغ اعتبار گروه مشتریان"
        name="CreditValue"
        rules={[{ required: true, message: "این فیلد الزامی است." }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
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
      </Form.Item>

      <Form.Item
        label="تاریخ اعتبار از"
        name="StartDate"
        rules={[{ required: true, message: "این فیلد الزامی است." }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <NewDatePicker />
      </Form.Item>

      <Form.Item
        label="تاریخ اعتبار تا"
        name="EndDate"
        rules={[{ required: true, message: "این فیلد الزامی است." }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <NewDatePicker />
      </Form.Item>

      <Form.Item
        label="ارز"
        name="CurrencyId"
        rules={[
          {
            required: true,
            message: "این فیلد الزامی است.",
          },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={{
            addWebUrl: "/api/sale/select/currencyAvailable",
            endpoint: "/api/sale/select/currencyAvailable",
            repoViewId: 130076,
          }}
        />
      </Form.Item>

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
