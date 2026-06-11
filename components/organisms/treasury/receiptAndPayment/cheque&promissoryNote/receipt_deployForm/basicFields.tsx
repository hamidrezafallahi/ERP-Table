import { Form, FormInstance } from "antd";
import React, { Dispatch, SetStateAction } from "react";
import { RequestConfigs } from "./type";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import {
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import { useTranslations } from "next-intl";
import InputText from "@components/atoms/defaultElements/inputText";
import CustomCheckbox from "@components/atoms/defaultElements/checkbox";
import { filterTypeStringEnum } from "@services/base/type";
import { voucherTypeMap } from "./conternt";

interface BasicFieldsProps {
  form: FormInstance;
  cashConfig: RequestConfigs;
  rpWayConfig: RequestConfigs;
  natureConfig: RequestConfigs;
  showGuaranteeCheckbox: boolean;
  setNatureOptions: Dispatch<SetStateAction<any[]>>;
  type: number;
}

const BasicFields = (props: BasicFieldsProps) => {
  const {
    cashConfig,
    form,
    natureConfig,
    rpWayConfig,
    setNatureOptions,
    showGuaranteeCheckbox,
    type,
  } = props;
  const t = useTranslations();

  return (
    <>
      <Form.Item
        label="تاریخ سند"
        name="VoucherDate"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col lg:col-span-2 !mb-0 !pb-0 text-xs"
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
        label="شماره سند"
        name="VoucherNumber"
        className="flex flex-col lg:col-span-1 !mb-0 !pb-0 text-xs"
      >
        <CustomInputNumber
          controls={false}
          min={0}
          disabled
          config={{
            name: "VoucherNumber",
            caption: "شماره سند",
            help: "",
            placeHolder: "",
            type: "text",
            selectEndpoint: {},
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="سند حسابداری"
        name="AccountingSerial"
        className="flex flex-col lg:col-span-1 !mb-0 !pb-0 text-xs"
      >
        <CustomInputNumber
          controls={false}
          min={0}
          disabled
          config={{
            name: "AccountingSerial ",
            caption: "سند حسابداری",
            help: "",
            placeHolder: "",
            type: "text",
            selectEndpoint: {},
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="تاریخ راس - روز"
        name="DayCountAndDate"
        className="flex flex-col lg:col-span-1 !mb-0 !pb-0 text-xs"
      >
        <InputText disabled value={form.getFieldValue("DayCountAndDate")} />
      </Form.Item>
      <Form.Item
        label="صندوقدار"
        name="CashierId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col lg:col-span-3 !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={cashConfig}
          showSearch
          allowClear
          onClear={() => form.setFieldValue("CashierId", null)}
          infinite
          config={{
            name: "CashierId",
            caption: "صندوقدار",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: cashConfig,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="دستور"
        name=""
        // rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col lg:col-span-2 !mb-0 !pb-0 text-xs"
      >
        <InputText disabled />
      </Form.Item>
      <Form.Item
        label="ماهیت چک"
        name="VoucherNatureId"
        rules={[{ required: true, message: t("form.required") }]}
        className={`${showGuaranteeCheckbox ? "col-span-1" : "col-span-2"} flex flex-col !mb-0 !pb-0 text-xs`}
      >
        <DynamicSelect
          dynamicValue={natureConfig}
          showSearch
          allowClear
          labelValue="selectValue"
          onOptionsChange={(opts) => setNatureOptions(opts)}
          onClear={() => form.setFieldValue("VoucherNatureId", null)}
          infinite
          config={{
            name: "VoucherNatureId",
            caption: "ماهیت چک",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: natureConfig,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      {showGuaranteeCheckbox && (
        <div className="flex items-end  h-16">
          <Form.Item
            name="IsGuaranteeWithoutDueDate"
            className="flex items-end !mb-0 !pb-0 text-xs"
          >
            <CustomCheckbox
              className="w-full"
              config={{
                name: "IsGuaranteeWithoutDueDate",
                caption: "فاقد سررسید",
                help: "",
                placeHolder: "",
                type: "text",
                selectEndpoint: {},
                setFieldValue: form.setFieldValue,
              }}
            >
              <div className="text-xs block truncate">فاقد سررسید</div>
            </CustomCheckbox>
          </Form.Item>
        </div>
      )}
      <Form.Item
        label="نحوه دریافت و پرداخت"
        name="RpWayId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col lg:col-span-4 !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={{
            ...rpWayConfig,
            Filters: {
              FilterInfo: [
                {
                  ColName: "VoucherTypeId",
                  Value: voucherTypeMap[type] ?? null,
                  FilterType: filterTypeStringEnum.Equal,
                },
              ],
            },
          }}
          showSearch
          allowClear
          onClear={() => form.setFieldValue("RpWayId", null)}
          infinite
          config={{
            name: "RpWayId",
            caption: "نحوه دریافت و پرداخت",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: rpWayConfig,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="شرح سند"
        name="VoucherDesc"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col lg:col-span-8 !mb-0 !pb-0 text-xs"
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
    </>
  );
};

export default BasicFields;
