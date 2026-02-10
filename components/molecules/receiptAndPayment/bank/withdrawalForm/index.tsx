import { useEffect, useState } from "react";

import { Form } from "antd";
import { useTranslations } from "next-intl";

import {
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import type { IRequestConfig } from "@type/elementType";
import { SystemEnum } from "@type/enum";

import type { IProps } from "./type";

export const AdvancedBankWithdrawalForm = ({ activePage, form }: IProps) => {
  const [debit, setDebit] = useState(0);
  const t = useTranslations();

  const bankAccountConfig: IRequestConfig = {
    addWebUrl: "api/com/Select/BankAccount4SelectOPtion",
    endpoint: "api/com/Select/BankAccount4SelectOPtion",
    repoViewId: 106081,
    addButton: {
      url: "com/bankAccount",
      SystemId: SystemEnum.com,
      RepoId: 106067,
    },
  };

  const totalPrice = activePage?.pageData?.find(
    (item) => item.name === "Price"
  )?.value;

  const cashStatementPricesValue = activePage?.pageData
    ?.find((item) => item.name === "CashStatements")
    ?.value?.map((item) => Number(item.Price))
    ?.filter((value) => !isNaN(value));
  const tankhahStatementPricesValue = activePage?.pageData
    ?.find((item) => item.name === "TankhahStatements")
    ?.value?.map((item) => Number(item.Price))
    ?.filter((value) => !isNaN(value));
  const tafsiliStatementPricesValue = activePage?.pageData
    ?.find((item) => item.name === "TafsiliStatements")
    ?.value?.map((item) => Number(item.Price))
    ?.filter((value) => !isNaN(value));
  const bankStatementPricesValue = activePage?.pageData
    ?.find((item) => item.name === "BankStatements")
    ?.value?.map((item) => Number(item.Price))
    ?.filter((value) => !isNaN(value));

  useEffect(() => {
    const totalDebit =
      (cashStatementPricesValue?.reduce((sum, current) => sum + current, 0) ||
        0) +
      (tankhahStatementPricesValue?.reduce(
        (sum, current) => sum + current,
        0
      ) || 0) +
      (tafsiliStatementPricesValue?.reduce(
        (sum, current) => sum + current,
        0
      ) || 0) +
      (bankStatementPricesValue?.reduce((sum, current) => sum + current, 0) ||
        0);

    if (totalDebit > 0) {
      setDebit(totalDebit);
    }
  }, [
    cashStatementPricesValue,
    tankhahStatementPricesValue,
    tafsiliStatementPricesValue,
    bankStatementPricesValue,
  ]);

  return (
    <Form
      form={form}
      name="advancedBankWithdrawalForm"
      layout="vertical"
      className="hidden-show-scrollBar gap-5 lg:gap-y-10 grid grid-cols-12 pt-4 lg:pt-0 h-auto max-h-[calc(100dvh-160px)] overflow-y-auto"
    >
      <Form.Item
        label="تاریخ سند"
        name="VoucherDate"
        rules={[{ required: true, message: t("form.required") }]}
        className="col-span-12 lg:col-span-6 !mb-0 !pb-0 text-xs"
      >
        <NewDatePicker
          config={{
            name: "VoucherDate",
            caption: "تاریخ سند",
            type: "date",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="از حساب بانکی"
        name="BankAccountId"
        rules={[{ required: true, message: t("form.required") }]}
        className="col-span-12 lg:col-span-6 !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={bankAccountConfig}
          showSearch
          allowClear
          onClear={() => form.setFieldValue("BankAccountId", null)}
          infinite
          config={{
            name: "BankAccountId",
            caption: "از حساب بانکی",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: bankAccountConfig,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="ارز"
        name="CurrencyId"
        className="col-span-12 lg:col-span-6 !mb-0 !pb-0 text-xs"
        style={{ display: "inline-block" }}
        rules={[{ required: true, message: t("form.required") }]}
      >
        <div className="w-full">
          <DynamicSelect
            dynamicValue={{
              addWebUrl: "/api/trh/select/currencyAvailable",
              endpoint: "/api/trh/select/currencyAvailable",
              repoViewId: 140036,
            }}
            config={{
              name: "CurrencyId",
              caption: "ارز",
              help: "",
              placeHolder: "",
              type: "selectOption",
              selectEndpoint: {
                addWebUrl: "/api/trh/select/currencyAvailable",
                endpoint: "/api/trh/select/currencyAvailable",
                repoViewId: 130065,
              },
              setFieldValue: form.setFieldValue,
            }}
          />
        </div>
      </Form.Item>
      <div className="relative col-span-12 lg:col-span-6">
        <Form.Item
          label="مبلغ"
          name="Price"
          rules={[{ required: true, message: t("form.required") }]}
          className="!mb-0 !pb-0 text-xs"
        >
          <CustomInputNumber
            min={0}
            name="Price"
            className=""
            controls={false}
            parser={(value) =>
              value?.replace(/\$\s?|(,*)/g, "") as unknown as number
            }
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            config={{
              name: "Price",
              caption: "مبلغ",
              help: "",
              placeHolder: "",
              type: "price",
              selectEndpoint: {},
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
        <div className="top-0 left-2 absolute flex items-center gap-2 pt-8">
          <span>{(totalPrice - debit || 0)?.toLocaleString("fa-IR")}</span>
        </div>
        <div className="flex items-end gap-2 w-full">
          <span>مانده</span>
          <span>xxx</span>
        </div>
      </div>
    </Form>
  );
};
