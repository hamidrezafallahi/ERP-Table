import React, {
  Dispatch,
  SetStateAction,
} from 'react';

import {
  Form,
  FormInstance,
} from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomSelect,
  DynamicSelect,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import CustomInputNumber from '@components/atoms/defaultElements/inputNumber';
import InputText from '@components/atoms/defaultElements/inputText';
import { Level4TypeEnum } from '@components/molecules/dynamicLevelFields/enum';

interface BasicFieldsProps {
  form: FormInstance;
  setUrls: Dispatch<
    SetStateAction<{
      addUrl: string;
      updateUrl: string;
      vti?: Level4TypeEnum;
    }>
  >;
  //   showGuaranteeCheckbox: boolean;
  //   setNatureOptions: Dispatch<SetStateAction<any[]>>;
  //   filteredVoucherTypes: any[];
  //   setAllVoucherTypes: Dispatch<SetStateAction<any[]>>;
}

const cashConfig = {
  addWebUrl: "/api/trh/Select/Cashier4SelectOption",
  endpoint: "/api/trh/Select/Cashier4SelectOption",
  repoViewId: 140002,
};

const rpWayConfig = {
  addWebUrl: "/api/trh/select/rpWay4voucher",
  endpoint: "/api/trh/select/rpWay4voucher",
  repoViewId: null,
};
const natureConfig = {
  addWebUrl: "/api/trh/select/commonInfo/voucherNature",
  endpoint: "/api/trh/select/commonInfo/voucherNature",
  repoViewId: null,
};

const MainFields = (props: BasicFieldsProps) => {
  const { form, setUrls } = props;
  const t = useTranslations();
  const options = [
    {
      label: "به بانک",
      value: "5064",
      title: "به بانک",
      urls: [
        "api/trh/insert/checkAssignment/atTheBank",
        "api/trh/update/checkAssignment/atTheBank",
        Level4TypeEnum.BankAccount,
      ],
    },
    {
      label: "به شخص",
      value: "5065",
      title: "به شخص",
      urls: [
        "/api/trh/insert/checkAssignment/atThePerson",
        "/api/trh/update/checkAssignment/atThePerson",
        Level4TypeEnum.Person,
      ],
    },
    {
      label: "به سایر صندوق ها",
      value: "5066",
      title: "به سایر صندوق ها",
      urls: [
        "/api/trh/insert/checkAssignment/atTheCash",
        "/api/trh/update/checkAssignment/atTheCash",
        Level4TypeEnum.Cashier,
      ],
    },
  ];
  return (
    <>
      <Form.Item
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
            type: "text",
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
        label="صندوقدار"
        name="CashierId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
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
        label="تاریخ راس - تعداد روز"
        name="DayCountAndDate"
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <InputText
          disabled
          value={form.getFieldValue("DayCountAndDate")}
          config={{
            name: "DayCountAndDate",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      <Form.Item
        label="ماهیت چک"
        name="VoucherNatureId"
        rules={[{ required: true, message: t("form.required") }]}
        className={`  "col-span-1" flex flex-col !mb-0 !pb-0 text-xs`}
      >
        <DynamicSelect
          dynamicValue={natureConfig}
          showSearch
          allowClear
          labelValue="selectValue"
          //   onOptionsChange={(opts) => setNatureOptions(opts)}
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
      <Form.Item
        label="شماره سند حسابداری"
        name="AccountingSerial"
        className="flex flex-col col-span-1 !mb-0 !pb-0 text-xs"
      >
        <CustomInputNumber
          controls={false}
          min={0}
          disabled
          config={{
            name: "AccountingSerial ",
            caption: "شماره سند حسابداری",
            help: "",
            placeHolder: "",
            type: "text",
            selectEndpoint: {},
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      <Form.Item
        label="نوع سند"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
        name="VoucherTypeId"
      >
        <CustomSelect
          options={options}
          config={{ name: "VoucherTypeId", setFieldValue: form.setFieldValue }}
          onChange={(value, option) => {
            const opt = option as { urls: any };
            setUrls({
              addUrl: opt.urls[0],
              updateUrl: opt.urls[1],
              vti: opt.urls[2],
            });
          }}
        />
      </Form.Item>
      <Form.Item
        label="نحوه دریافت و پرداخت"
        name="RpWayId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
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
    </>
  );
};

export default MainFields;
