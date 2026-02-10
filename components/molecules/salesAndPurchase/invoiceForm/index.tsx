import {
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import { Form, InputNumber } from "antd";
import { IProps } from "./type";
import { useTranslations } from "next-intl";
import { useSaleConfigs } from "../saleConfigsHook";

export const InvoiceForm = ({ activePage, form }: IProps) => {
  const t = useTranslations();
  const { salesTypeConfig } = useSaleConfigs();

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
            caption: "تاریخ",
            type: "date",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="نوع فروش"
        name="SaleTypeId"
        rules={[{ required: true, message: t("form.required") }]}
        className="col-span-12 lg:col-span-4 !mb-0 !pb-0 text-xs"
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
      {/* <Form.Item
        label="نحوه پرداخت"
        name="DiscountPaymentWaysIds"
        className="col-span-12 lg:col-span-4 !mb-0 !pb-0 text-xs"
      >
        {!match ? (
          <DynamicMultiSelect
            dynamicValue={{
              addWebUrl: "api/sale/Select/PaymentWay4SelectOption",
              endpoint: "api/sale/Select/PaymentWay4SelectOption",
              repoViewId: 130051,
            }}
            config={{
              caption: "نحوه پرداخت",
              name: "DiscountPaymentWaysIds",
              setFieldValue: form.setFieldValue,
            }}
          />
        ) : (
          <MultiSelectWithList
            defOption={DiscountPaymentWaysIdsDef}
            dynamicValue={{
              addWebUrl: "api/sale/Select/PaymentWay4SelectOption",
              endpoint: "api/sale/Select/PaymentWay4SelectOption",
              repoViewId: 130051,
            }}
            config={{
              caption: "نحوه پرداخت",
              name: "DiscountPaymentWaysIds",
              setFieldValue: form.setFieldValue,
            }}
            listHeight={95}
          />
        )}
      </Form.Item> */}
      <div className="relative col-span-12 lg:col-span-6">
        <Form.Item
          label="مبلغ"
          name="Price"
          rules={[{ required: true, message: t("form.required") }]}
          className="!mb-0 !pb-0 text-xs"
        >
          <InputNumber
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
            // config={{
            //   name: "Price",
            //   caption: "مبلغ",
            //   help: "",
            //   placeHolder: "",
            //   type: "price",
            //   selectEndpoint: {},
            //   setFieldValue: form.setFieldValue,
            // }}
          />
        </Form.Item>
      </div>
    </Form>
  );
};
