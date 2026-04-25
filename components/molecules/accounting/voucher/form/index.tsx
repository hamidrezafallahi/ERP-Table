import { FC } from 'react';

import { Form } from 'antd';
import { useTranslations } from 'next-intl';

import {
  DynamicSelect,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import CustomInputNumber from '@components/atoms/defaultElements/inputNumber';
import InputText from '@components/atoms/defaultElements/inputText';

export const VoucherForm: FC<any> = ({ form }) => {
  const t = useTranslations();

  return (
    <Form
      form={form}
      layout="vertical"
      className={`lg:grid lg:grid-cols-4 lg:gap-2 flex flex-col gap-3`}
    >
      {/* <Form.Item
        label={t("general.voucherNumber")}
        name="VoucherNumber"
        
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <CustomInputNumber
          config={{
            caption: t("general.voucherNumber"),
            name: "VoucherNumber",
            type: "number",
            setFieldValue: form.setFieldValue,
          }}
          min={0}
          controls={false}
          type="number"
          name="VoucherNumber"
        />
      </Form.Item> */}
      <Form.Item
        label={t("general.voucherDate")}
        name="VoucherDate"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "date" },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <NewDatePicker
        
          config={{
            caption: t("general.voucherDate"),
            name: "VoucherDate",
            type: "date",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label={t("general.voucherType")}
        name="VoucherTypeId"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "number" },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          showSearch
          allowClear
          optionFilterProp={"label"}
          dynamicValue={{
            addWebUrl: "/api/acc/select/voucherType4searchBox",
            endpoint: "/api/acc/select/voucherType4searchBox",
            repoViewId: null,
            OrderInfo: [
              {
                Asc: true,
                ColName: "VoucherTypeId",
              },
            ],
          }}
          config={{
            caption: t("general.voucherType"),
            name: "VoucherTypeId",
            type: "number",
            setFieldValue: form.setFieldValue,
          }}
          autoFocus
        />
      </Form.Item>
      <Form.Item
        label={t("general.referNumber")}
        name="ReferNumber"
        rules={
          [
            // { required: true, message: "این فیلد الزامی است.", type: "number" },
          ]
        }
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <CustomInputNumber
          config={{
            caption: t("general.referNumber"),
            name: "ReferNumber",
            type: "number",
            setFieldValue: form.setFieldValue,
          }}
          type="number"
          min={0}
          controls={false}
        />
      </Form.Item>
      <Form.Item
        label={t("general.voucherDescription")}
        name="VoucherDesc"
        rules={[
          { required: false, message: "این فیلد الزامی است.", type: "string" },
        ]}
        className="flex flex-col col-span-4 !mb-0 !pb-0 text-xs"
      >
        <InputText
          config={{
            caption: t("general.voucherDescription"),
            name: "VoucherDesc",
            type: "text",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
    </Form>
  );
};
