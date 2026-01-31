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
import { SystemEnum } from "@type/enum";

export const BillsForm = ({ form, currency }) => {
  const t = useTranslations();

  const params = useSearchParams();
  const id = Number(params.get("id"));

  const patternConfig: IRequestConfig = {
    addWebUrl: null,
    endpoint: null,
    repoViewId: null,
  };
  const paymentMethodConfig: IRequestConfig = {
    addWebUrl: "api/sale/select/settlementWay",
    endpoint: "api/sale/select/settlementWay",
    repoViewId: null,
  };
  const customerConfig: IRequestConfig = {
    addWebUrl: "api/sale/select/customer4SelectOption/elk",
    endpoint: "api/sale/select/customer4SelectOption/elk",
    repoViewId: 130045,
    addButton: {
      url: "sale/customer",
      RepoId: 1012,
      SystemId: SystemEnum.sale,
    },
  };

  const salesTypeConfig: IRequestConfig = {
    addWebUrl: "api/sale/select/type4SelectOption",
    endpoint: "api/sale/select/type4SelectOption",
    repoViewId: 130044,
    addButton: {
      url: "sale/saleType",
      RepoId: 1006,
      SystemId: SystemEnum.sale,
    },
  };

  return (
    <Form
      form={form}
      name="sellWithCustomerForm"
      layout="vertical"
      className={`flex flex-col gap-2 lg:grid lg:grid-cols-4 lg:gap-3  max-h-[calc(100dvh-160px)]  `}
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
              caption: "مرجع",
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
        label="شماره ارجاع"
        name="ReferNumber"
        rules={[]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <InputNumber
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
        label="روش تسویه"
        name="PayOfTypeId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={paymentMethodConfig}
          showSearch
          allowClear
          onClear={() => form.setFieldValue("PayOfTypeId", null)}
          infinite
          config={{
            name: "PayOfTypeId",
            caption: "روش تسویه",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: paymentMethodConfig,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label={
          <span className="text-xs">شماره اشتراک / شناسه قبض بهره بردار</span>
        }
        name="SubscriberNumber"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <InputText
          config={{
            name: "SubscriberNumber",
            caption: "شماره اشتراک / شناسه قبض بهره بردار",
            help: "",
            placeHolder: "",
            type: "text",
            selectEndpoint: {},
            setFieldValue: form.setFieldValue,
          }}
        />
        {/* <InputNumber
          controls={false}
          min={0}
          config={{
            name: "SubscriberNumber",
            caption: "شماره اشتراک / شناسه قبض بهره بردار",
            help: "",
            placeHolder: "",
            type: "text",
            selectEndpoint: {},
            setFieldValue: form.setFieldValue,
          }}
        /> */}
      </Form.Item>
      {!!currency && (
        <div className="flex items-center gap-4 p-4 border-2 border-gray-300 border-dashed text-xs">
          <span>نوع ارز</span>
          <span>{currency}</span>
        </div>
      )}
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
