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
import type { IRequestConfig } from "@type/elementType";
import { SystemEnum } from "@type/enum";

import type { IProps } from "./type";

export const BankDeposit = ({
  form,
  mutateIsLoading,
  onClear,
  bankAccounts,
  formValues,
}: IProps) => {
  const t = useTranslations();

  const bankAccountConfig: IRequestConfig = {
    addWebUrl: "api/com/Select/bankAccount4SelectOption",
    endpoint: "api/com/Select/bankAccount4SelectOption",
    repoViewId: 106081,
    addButton: {
      url: "com/bankAccount",
      SystemId: SystemEnum.com,
      RepoId: 106067,
    },
  };

  return (
    <div className="gap-5 grid grid-cols-12">
      <Form.Item
        label={t("systemSetting.depositDate")}
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
        label={t("general.amount")}
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
        label={t("general.receiptNumber")}
        name="FishNumber"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col col-span-6 !mb-0 !pb-0 text-xs"
      >
        <InputText />
      </Form.Item>
      {!bankAccounts.showSingle && (
        <Form.Item
          label={t("general.currentAccount")}
          name="BankAccountId"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col col-span-6 !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={bankAccountConfig}
            config={{
              name: "BankAccountId",
              setFieldValue: form.setFieldValue,
            }}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("BankAccountId", null)}
            infinite
          />
        </Form.Item>
      )}

      {bankAccounts.showSingle && (
        <span className="justify-self-center self-center font-bold">
          {bankAccounts.desc}
        </span>
      )}
      <Form.Item
        label={t("general.description")}
        name="VoucherDesc"
        rules={[]}
        className="flex flex-col col-span-12 !mb-0 !pb-0 text-xs"
      >
        <InputText />
      </Form.Item>
      <Form.Item className="col-span-12 m-0 p-0 text-xs">
        <div className="flex justify-end items-center gap-2 pt-2">
          <CustomTooltip title={t("general.addNew")}>
            <span
              className="bg-gray-gray3 px-2 py-[2.8px] rounded cursor-pointer"
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
            className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
          >
            {mutateIsLoading ? (
              <Spin size="large" indicator={<SpinIcon />} />
            ) : (
              t("general.submit")
            )}
          </CustomButton>
          <span
            className="flex justify-center items-center px-2 border-2 border-black-black8 rounded h-[32px] cursor-pointer"
            onClick={() => {
              null;
            }}
          >
            {t("general.sendToPaymentGateway")}
          </span>
        </div>
      </Form.Item>
    </div>
  );
};
