import { Form } from "antd";
import { useTranslations } from "next-intl";

import { NewDatePicker } from "@components/atoms/defaultElements";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import InputText from "@components/atoms/defaultElements/inputText";
import type { IRequestConfig } from "@type/elementType";

import { SelectHeader } from "../selectHeaderReturnInvoice";

export const ReturnSalesInvoiceForm = ({ form }) => {
  const t = useTranslations();

  const customerConfig: IRequestConfig = {
    addWebUrl: "api/sale/select/invoice4selectOption/elk",
    endpoint: "api/sale/select/invoice4selectOption/elk",
    // repoViewId: 1052,
  };

  return (
    <Form
      form={form}
      name="returnSalesInvoiceForm"
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
        label="فاکتور مرجع"
        name="InvoiceHeaderId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col col-span-2 !mb-0 !pb-0 text-xs"
      >
        <SelectHeader
          config={{
            name: "InvoiceHeaderId",
            caption: "فاکتور مرجع",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: customerConfig,
            form: form,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      <Form.Item
        label="شرح سند"
        name="VoucherDesc"
        rules={[{ required: true, message: t("form.required") }]}
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
