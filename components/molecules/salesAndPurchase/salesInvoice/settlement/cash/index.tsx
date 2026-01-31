import { Form, Spin } from "antd";
import { useTranslations } from "next-intl";

import {
  CustomButton,
  CustomTooltip,
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import InputText from "@components/atoms/defaultElements/inputText";
import { PlusOutline, SpinIcon } from "@components/atoms/iconComponents";

import type { IProps } from "./type";

export const Cash = ({
  form,
  mutateIsLoading,
  onClear,
  formValues,
}: IProps) => {
  const t = useTranslations();

  return (
    <div className="gap-5 grid grid-cols-12">
      <Form.Item
        label={t("systemSetting.paymentDate")}
        name="VoucherDate"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col col-span-6 !mb-0 !pb-0 text-xs"
      >
        <NewDatePicker defaultValue={formValues?.["VoucherDate"]} />
      </Form.Item>
      <Form.Item
        label="ارز"
        name="CurrencyId"
        className="col-span-6 !mb-0 !pb-0 text-xs"
        style={{ display: "inline-block" }}
        rules={[{ required: true, message: t("form.required") }]}
      >
        <div className="w-full">
          <DynamicSelect
            dynamicValue={{
              addWebUrl: "/api/sale/select/currencyAvailable",
              endpoint: "/api/sale/select/currencyAvailable",
              repoViewId: 130076,
            }}
            config={{
              caption: "ارز",
              name: "CurrencyId",
              setFieldValue: form.setFieldValue,
            }}
          />
        </div>
      </Form.Item>
      <Form.Item
        label={t("general.cash")}
        name="PaymentAmount"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col col-span-6 !mb-0 !pb-0 text-xs"
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
        label={t("general.caption")}
        name="VoucherDesc"
        rules={[]}
        className="flex flex-col col-span-6 !mb-0 !pb-0 text-xs"
      >
        <InputText />
      </Form.Item>
      <Form.Item className="col-span-12 m-0 p-0 text-xs">
        <div className="flex justify-end items-center gap-4">
          <CustomTooltip title={t("general.addNew")}>
            <span
              className="flex justify-center items-center bg-gray-gray3 rounded w-9 h-9 cursor-pointer"
              onClick={() => {
                onClear();
                form.resetFields();
              }}
            >
              <PlusOutline />
            </span>
          </CustomTooltip>
          <CustomButton
            type="text"
            htmlType="submit"
            className="bg-black-black8 hover:bg-white px-6 border hover:border-black-black8 rounded h-9 text-white disabled:text-gray-gray6 text-xs"
          >
            {mutateIsLoading ? (
              <Spin size="large" indicator={<SpinIcon />} />
            ) : (
              t("general.submit")
            )}
          </CustomButton>
        </div>
      </Form.Item>
    </div>
  );
};
