import { Form } from "antd";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

import {
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import InputNumber from "@components/atoms/defaultElements/inputNumber";
import InputText from "@components/atoms/defaultElements/inputText";
import type { IRequestConfig } from "@type/elementType";

export const BuyRequestForm = ({ form }) => {
  const t = useTranslations();

  const params = useSearchParams();
  const id = Number(params.get("id"));

  const patternConfig: IRequestConfig = {
    addWebUrl: null,
    endpoint: null,
    repoViewId: null,
  };

  return (
    <Form
      form={form}
      name="buyRequestForm"
      layout="vertical"
      className={`flex flex-col gap-2 lg:grid lg:grid-cols-4 lg:gap-3   `}
    >
      {id ? (
        <Form.Item
          label="شماره فاکتور"
          name="VoucherNumber"
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <InputNumber
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
        </Form.Item>
      ) : (
        <Form.Item
          label="الگوی شماره گذاری"
          name="PatternId"
          // rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={patternConfig}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("PatternId", null)}
            infinite
            config={{
              name: "PatternId",
              caption: "الگوی شماره گذاری",
              help: "",
              placeHolder: "",
              type: "selectOption",
              selectEndpoint: patternConfig,
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      )}
      <Form.Item
        label="تاریخ فاکتور"
        name="VoucherDate"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <NewDatePicker
          config={{
            name: "VoucherDate",
            caption: "تاریخ فاکتور",
            type: "date",
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
