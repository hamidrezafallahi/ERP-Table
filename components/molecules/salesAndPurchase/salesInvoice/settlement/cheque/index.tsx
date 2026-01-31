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

export const Cheque = ({
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
        label={t("systemSetting.chequeDate")}
        name="VoucherDate"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs col-span-6"
      >
        <NewDatePicker defaultValue={formValues?.["VoucherDate"]} />
      </Form.Item>
      <Form.Item
        label={t("general.amount")}
        name="PaymentAmount"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs col-span-6"
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
        label={t("systemSetting.chequeNumber")}
        name="Num"
        rules={[
          { required: true, message: t("form.required") },
          { min: 16, message: t("form.minLength", { count: 16 }) },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs col-span-6"
      >
        <InputText />
      </Form.Item>
      {!bankAccounts.showSingle && (
        <Form.Item
          label={t("systemSetting.bank")}
          name="BankId"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs col-span-6"
        >
          <DynamicSelect
            dynamicValue={bankAccountConfig}
            config={{
              name: "BankId",
              setFieldValue: form.setFieldValue,
            }}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("BankId", null)}
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
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs col-span-12"
      >
        <InputText />
      </Form.Item>
      <Form.Item className="col-span-12 m-0 p-0 text-xs">
        <div className="flex justify-end items-center gap-2 pt-2">
          <CustomTooltip title={t("general.addNew")}>
            <span
              className=" px-2 py-[2.8px] border-2 bg-gray-gray3 rounded cursor-pointer"
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
            // disabled={id ? changeFields.length === 0 : !formIsValid}
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
