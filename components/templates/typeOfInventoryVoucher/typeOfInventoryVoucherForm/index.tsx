import { Form } from "antd";
import { useTranslations } from "next-intl";

import { NewDatePicker } from "@components/atoms/defaultElements";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import InputText from "@components/atoms/defaultElements/inputText";
import { SelectHeader } from "@components/molecules/salesAndPurchase/salesInvoice";
import type { IRequestConfig } from "@type/elementType";

export const TypeOfInventoryVoucherForm = ({ form }) => {
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
      <Form.Item
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
      </Form.Item>
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
        label="نوع سند"
        name=""
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <SelectHeader
          config={{
            name: "ReferNumber",
            caption: "نوع سند",
            help: "حواله مصرف",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: customerConfig,
            form: form,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="مرجع"
        name="InvoiceHeaderId"
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <SelectHeader
          config={{
            name: "InvoiceHeaderId",
            caption: "مرجع",
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
        label="نام انبار"
        name=" "
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <SelectHeader
          config={{
            name: "InvoiceHeaderId",
            caption: "نام انبار",
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
        className="flex flex-col col-span-4 !mb-0 !pb-0 text-xs"
      >
        <InputText
          config={{
            name: "VoucherDesc",
            caption: "شرح سند",
            help: "متن خود را بنویسید",
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
