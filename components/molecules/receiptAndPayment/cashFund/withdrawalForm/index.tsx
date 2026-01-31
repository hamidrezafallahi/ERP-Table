import { Form } from "antd";
import { useTranslations } from "next-intl";

import {
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import type { IRequestConfig } from "@type/elementType";

export const AdvancedCashFundWithdrawalForm = () => {
  const t = useTranslations();
  const [form] = Form.useForm();

  const cashFundConfig: IRequestConfig = {
    addWebUrl: "/api/trh/Select/TankhahDar4SelectOption",
    endpoint: "/api/trh/Select/TankhahDar4SelectOption",
    repoViewId: 140002,
  };

  return (
    <Form
      form={form}
      name="advancedCashFundWithdrawalForm"
      layout="vertical"
      className={`flex flex-col gap-2 lg:grid lg:grid-cols-2 lg:gap-3  max-h-[calc(100dvh-160px)] h-auto overflow-y-auto hidden-show-scrollBar`}
    >
      {/* <Form.Item
        label="شماره سند"
        name="VoucherNumber"
        rules={[{ required: true, message: t("form.required") }]}
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
        label="از تنخواه"
        name="TankhahdarId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={cashFundConfig}
          showSearch
          allowClear
          onClear={() => form.setFieldValue("TankhahdarId", null)}
          infinite
          config={{
            name: "TankhahdarId",
            caption: "از تنخواه",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: cashFundConfig,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      <div className="flex items-end gap-2">
        <span>مانده</span>
        <span>xxx</span>
      </div>
    </Form>
  );
};
