import {
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import { Form } from "antd";
import { IProps } from "./type";
import { useTranslations } from "next-intl";
import InputText from "@components/atoms/defaultElements/inputText";
import { useSaleConfigs } from "../saleConfigsHook";

export const PaymentRequestForm = ({ activePage, form }: IProps) => {
  const t = useTranslations();
  const { customerConfig } = useSaleConfigs();

  return (
    <Form
      form={form}
      name="paymentRequestForm"
      layout="vertical"
      className="hidden-show-scrollBar gap-5 lg:gap-y-5 grid grid-cols-12 pt-4 lg:pt-0 h-auto max-h-[calc(100dvh-160px)] overflow-y-auto"
    >
      <Form.Item
        label="تاریخ"
        name="PaymentRequestDate"
        rules={[{ required: true, message: t("form.required") }]}
        className="col-span-12 lg:col-span-4 !mb-0 !pb-0 text-xs"
      >
        <NewDatePicker
          config={{
            name: "PaymentRequestDate",
            caption: "تاریخ",
            type: "date",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="شماره"
        name="PaymentRequestNumber"
        className="col-span-12 lg:col-span-4 !mb-0 !pb-0 text-xs"
      >
        <InputText
          config={{
            caption: "شماره",
            name: "PaymentRequestNumber",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="مشتری"
        name="CustomerId"
        rules={[{ required: true, message: t("form.required") }]}
        className="col-span-12 lg:col-span-4 !mb-0 !pb-0 text-xs"
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
      <div className="col-span-12">
        <Form.Item
          label="توضیحات"
          name="Description"
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <InputText />
        </Form.Item>
      </div>
    </Form>
  );
};
