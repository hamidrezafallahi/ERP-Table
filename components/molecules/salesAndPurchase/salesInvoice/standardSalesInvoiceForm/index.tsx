import { Form } from "antd";
import { useTranslations } from "next-intl";

import {
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import InputText from "@components/atoms/defaultElements/inputText";
import type { IRequestConfig } from "@type/elementType";
import { SystemEnum } from "@type/enum";
import { useSaleConfigs } from "../../saleConfigsHook";

export const StandardSalesInvoiceForm = ({ form }) => {
  const t = useTranslations();
  const { customerConfig, salesTypeConfig } = useSaleConfigs();

  return (
    <Form
      form={form}
      name="standardSalesInvoiceForm"
      layout="vertical"
      className={`flex flex-col gap-2 lg:grid lg:grid-cols-4 lg:gap-3 max-h-[calc(100dvh-160px)]  `}
    >
      {/* <Form.Item
        label="شماره سند"
        name="VoucherNumber"

        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <CustomInputNumber
          controls={false}
          min={0}
          config={{
            name: "VoucherNumber",
            caption: "شماره سند",
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

      {/* <Form.Item
        label="مرجع"
        name="ReferNumber"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={referenceConfig}
          showSearch
          allowClear
          onClear={() => form.setFieldValue("ReferNumber", null)}
          infinite
          config={{
            name: "ReferNumber",
            caption: "مرجع",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: referenceConfig,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item> */}
      <Form.Item
        label="شماره ارجاع"
        name="ReferNumber"
        rules={[]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <CustomInputNumber
          controls={false}
          min={0}
          config={{
            name: "ReferNumber",
            caption: "شماره ارجاع",
            help: "",
            placeHolder: "",
            type: "text",
            selectEndpoint: {},
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="مشتری"
        name="CustomerId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={customerConfig}
          showSearch
          allowClear
          onClear={() => form.setFieldValue("", null)}
          infinite
          config={{
            name: "CustomerId",
            caption: "مشتری",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: customerConfig,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="نوع فروش"
        name="SaleTypeId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={salesTypeConfig}
          showSearch
          allowClear
          showId
          onClear={() => form.setFieldValue("", null)}
          infinite
          config={{
            name: "SaleTypeId",
            caption: "نوع فروش",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: salesTypeConfig,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="شرح سند"
        name="VoucherDesc"
        rules={[]}
        className="flex flex-col col-span-4 !mb-0 !pb-0 text-xs"
      >
        <InputText
          config={{
            name: "VoucherDesc",
            caption: "شرح سند",
            help: "",
            placeHolder: "",
            type: "text",
            selectEndpoint: {},
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
    </Form>
  );
};
