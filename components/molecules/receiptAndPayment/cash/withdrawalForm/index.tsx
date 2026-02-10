import { useEffect, useState } from "react";

import { Form } from "antd";
import { useTranslations } from "next-intl";

import {
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import type { IRequestConfig } from "@type/elementType";

import type { IProps } from "./type";

export const AdvancedCashWithdrawalForm = ({ activePage }: IProps) => {
  const [debit, setDebit] = useState(0);

  const t = useTranslations();
  const [form] = Form.useForm();

  const cashConfig: IRequestConfig = {
    addWebUrl: "/api/trh/Select/Cashier4SelectOption",
    endpoint: "/api/trh/Select/Cashier4SelectOption",
    repoViewId: 140002,
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
      name="advancedCashWithdrawalForm"
      layout="vertical"
      className={`flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-3  max-h-[calc(100dvh-160px)] h-auto overflow-y-auto hidden-show-scrollBar`}
    >
      {/* <Form.Item
        label="شماره سند"
        name="VoucherNumber"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <CustomInputNumber
            controls={false}
            min={0}
            disabled
            config={{
              name: "VoucherNumber",
              caption: "شماره فاکتور",
              help: "",
              placeHolder: "",
              type: "number",
              selectEndpoint: {},
              setFieldValue: form.setFieldValue,
            }}
          />
      </Form.Item> */}
      <Form.Item
        label="تاریخ سند"
        name="VoucherDate"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
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
        label="از صندوقدار"
        name="CashierId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={cashConfig}
          showSearch
          allowClear
          onClear={() => form.setFieldValue("CashierId", null)}
          infinite
          config={{
            name: "CashierId",
            caption: "از صندوقدار",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: cashConfig,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      <div className="relative">
        <Form.Item
          label="مبلغ"
          name="Price"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <CustomInputNumber
            min={0}
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
              type: "number",
              selectEndpoint: {},
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
        <div className="top-0 left-2 absolute flex items-center gap-2 pt-8">
          <span>{(totalPrice - debit || 0)?.toLocaleString("fa-IR")}</span>
        </div>
      </div>
      <div className="flex items-end gap-2">
        <span>مانده</span>
        <span>xxx</span>
      </div>
    </Form>
  );
};
