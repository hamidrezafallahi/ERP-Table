import { Form, FormInstance } from "antd";
import React, { Dispatch, SetStateAction, useEffect } from "react";
import { RequestConfigs } from "./type";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import {
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import { useTranslations } from "next-intl";
import InputText from "@components/atoms/defaultElements/inputText";
import CustomCheckbox from "@components/atoms/defaultElements/checkbox";

interface BasicFieldsProps {
  form: FormInstance;
  rpWayConfig: RequestConfigs;
  natureConfig: RequestConfigs;
  issuanceBankConfig: RequestConfigs;
  documnetTypeConfig: RequestConfigs;
  showGuaranteeCheckbox: boolean;
  setNatureOptions: Dispatch<SetStateAction<any[]>>;
  filteredVoucherTypes: any[];
  setAllVoucherTypes: Dispatch<SetStateAction<any[]>>;
}

const BasicFields = (props: BasicFieldsProps) => {
  const {
    form,
    natureConfig,
    rpWayConfig,
    setNatureOptions,
    showGuaranteeCheckbox,
    documnetTypeConfig,
    filteredVoucherTypes,
    setAllVoucherTypes,
    issuanceBankConfig,
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
            caption: "شماره فاکتور",
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
        label="دستور"
        // rules={[{ required: true, message: t("form.required") }]}
        className="lg:col-span-2 flex flex-col !mb-0 !pb-0 text-xs"
      >
        <InputText disabled />ّ
      </Form.Item>
      <Form.Item
        label="حساب بانکی"
        name="BankAccountId"
        rules={[{ required: true, message: t("form.required") }]}
        className="lg:col-span-2 flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={issuanceBankConfig}
          showSearch
          allowClear
          onClear={() => form.setFieldValue("", null)}
          infinite
          config={{
            name: "BankAccountId",
            caption: "پرداخت از بانک",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: issuanceBankConfig,
            setFieldValue: form.setFieldValue,
          }}
          popupMatchSelectWidth={250}
        />
      </Form.Item>
      <Form.Item
        label="ماهیت چک"
        name="VoucherNatureId"
        rules={[{ required: true, message: t("form.required") }]}
        className={`${showGuaranteeCheckbox ? "col-span-2" : "col-span-4"} flex flex-col !mb-0 !pb-0 text-xs`}
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
        <div className="flex items-end h-16">
          <Form.Item
            name="IsGuaranteeWithoutDueDate"
            className="flex items-end !mb-0 !pb-0 text-xs"
          >
            <CustomCheckbox
              className="w-full"
              config={{
                name: "IsGuaranteeWithoutDueDate",
                caption: "تضمینی فاقد سررسید",
                help: "",
                placeHolder: "",
                type: "text",
                selectEndpoint: {},
                setFieldValue: form.setFieldValue,
              }}
            >
              <div className="text-xs block truncate">تضمینی فاقد سررسید</div>
            </CustomCheckbox>
          </Form.Item>
        </div>
      )}
      <Form.Item
        label="نوع سند"
        name="VoucherTypeId"
        rules={[{ required: true, message: t("form.required") }]}
        className="col-span-2 flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={documnetTypeConfig}
          showSearch
          allowClear
          value={null}
          onClear={() => form.setFieldValue("VoucherTypeId", null)}
          infinite
          options={filteredVoucherTypes}
          onOptionsChange={(opts) => setAllVoucherTypes(opts)}
          config={{
            name: "VoucherTypeId",
            caption: "نوع سند",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: documnetTypeConfig,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="نحوه دریافت و پرداخت"
        name="RpWayId"
        rules={[{ required: true, message: t("form.required") }]}
        className="col-span-4 flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={rpWayConfig}
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
        rules={[]}
        className="flex flex-col col-span-6 !mb-0 !pb-0 text-xs"
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
