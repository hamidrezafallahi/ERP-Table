import { useState } from "react";

import { Form } from "antd";
import { useTranslations } from "next-intl";

import {
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import EndDateTimePicker from "@components/atoms/defaultElements/endDateTimePicker";
import InputText from "@components/atoms/defaultElements/inputText";
import StartDateTimePicker from "@components/atoms/defaultElements/startDateTimePicker";
import { SystemEnum } from "@type/enum";

export const PricingCircularForm = ({ form, isEdit }) => {
  const t = useTranslations();

  const [isNow, setIsNow] = useState(false);

  return (
    <Form
      form={form}
      name="pricingCircularForm"
      layout="vertical"
      className={`gap-2 lg:grid lg:grid-cols-4 lg:gap-y-4 flex flex-col`}
    >
      <Form.Item
        label="شماره"
        name="PriceOrderNumber"
        className="col-span-1 !mb-0 !pb-0 text-xs"
        rules={[{ required: true, message: t("form.required") }]}
      >
        <InputText
          config={{
            caption: "شماره",
            name: "PriceOrderNumber",
            type: "string",
            setFieldValue: form.setFieldValue,
          }}
          type="string"
          name="PriceOrderNumber"
        />
      </Form.Item>

      <Form.Item
        label="تاریخ"
        name="PriceOrderDate"
        className="col-span-1 !mb-0 !pb-0 text-xs"
        rules={[{ required: true, message: t("form.required") }]}
      >
        <NewDatePicker
          className="!w-full"
          config={{
            caption: "تاریخ",
            name: "PriceOrderDate",
            type: "string",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      <Form.Item
        label={t("title.customer")}
        name="CustomerId"
        className="col-span-2 !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          config={{
            caption: t("title.customer"),
            name: "CustomerId",
            type: "selectOption",
            setFieldValue: form.setFieldValue,
            selectEndpoint: {
              addWebUrl: "api/sale/Select/Customer4SelectOption",
              endpoint: "api/sale/Select/Customer4SelectOption",
              repoViewId: 130045,
              addButton: {
                url: "sale/customer",
                RepoId: 1012,
                SystemId: SystemEnum.sale,
              },
            },
          }}
          dynamicValue={{
            addWebUrl: "api/sale/Select/Customer4SelectOption",
            endpoint: "api/sale/Select/Customer4SelectOption",
            repoViewId: 130045,
            addButton: {
              url: "sale/customer",
              RepoId: 1012,
              SystemId: SystemEnum.sale,
            },
          }}
        />
      </Form.Item>

      <Form.Item
        label="توضیحات"
        name="PriceOrderDesc"
        className="col-span-4 !mb-0 !pb-0 text-xs"
      >
        <InputText
          config={{
            caption: "توضیحات تعرفه",
            name: "PriceOrderDesc",
            type: "string",
            setFieldValue: form.setFieldValue,
          }}
          type="string"
          name="PriceOrderDesc"
        />
      </Form.Item>

      <div className="col-span-2">
        <StartDateTimePicker
          isNow={isNow}
          setIsNow={setIsNow}
          config={{
            name: "StartDate",
            setFieldValue: form.setFieldValue,
          }}
        />
      </div>
      <div className="col-span-2">
        <EndDateTimePicker
          initialShowEndDate={isEdit ? false : true}
          config={{
            name: "EndDate",
            setFieldValue: form.setFieldValue,
          }}
        />
      </div>
    </Form>
  );
};
