import { FC } from 'react';

import { Form } from 'antd';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

import {
  CustomDropdownButton,
  CustomTooltip,
  DynamicSelect,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import CustomInputNumber from '@components/atoms/defaultElements/inputNumber';
import InputText from '@components/atoms/defaultElements/inputText';
import {
  Dots,
  SavePlus,
} from '@components/atoms/iconComponents';

import { useVoucherDescription } from './useVoucherDescription';

export const VoucherForm: FC<any> = ({ form, onSubmitCallback }) => {
  const t = useTranslations();
  const params = useSearchParams();
  const id = Number(params.get("id"));
  const voucherTypeId = Form.useWatch("VoucherTypeId", form);

  const { inputKey, items, isDisabled, lang, handleSaveDescription } =
    useVoucherDescription({
      form,
      voucherTypeId,
    });
  return (
    <Form
      form={form}
      onFinish={onSubmitCallback}
      layout="vertical"
      className={`lg:grid lg:grid-cols-12 lg:gap-x-5 lg:gap-y-5 flex flex-col w-full gap-3`}
    >
      {id>0 && (
        <Form.Item
          label={t("general.voucherNumber")}
          name="voucherNumber"
          className={`flex flex-col ${id>0 ? "lg:col-span-3" : "lg:col-span-4"} !mb-0 !pb-0 w-full text-xs`}
        >
          <InputText
            readOnly
            config={{
              caption: t("general.voucherDescription"),
              name: "VoucherNumber",
              type: "text",
            }}
          />
        </Form.Item>
      )}
      <Form.Item
        label={t("general.voucherDate")}
        name="VoucherDate"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "date" },
        ]}
          className={`flex flex-col ${id>0? "lg:col-span-3" : "lg:col-span-4"} !mb-0 !pb-0 w-full text-xs`}
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
          className={`flex flex-col ${id>0 ? "lg:col-span-3" : "lg:col-span-4"} !mb-0 !pb-0 w-full text-xs`}
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
          className={`flex flex-col ${id>0 ? "lg:col-span-3" : "lg:col-span-4"} !mb-0 !pb-0 w-full text-xs`}
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
      <div className="flex lg:items-end gap-2 lg:col-span-12 w-full">
        <Form.Item
          label={t("general.voucherDescription")}
          name="VoucherDesc"
          rules={[
            {
              required: false,
              message: "این فیلد الزامی است.",
              type: "string",
            },
          ]}
          className="flex flex-col !mb-0 !pb-0 w-full text-xs"
        >
          <InputText
            key={inputKey}
            config={{
              caption: t("general.voucherDescription"),
              name: "VoucherDesc",
              type: "text",
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
        <CustomDropdownButton
          placement={lang !== "fa" ? "bottomRight" : "bottomLeft"}
          className={`${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} flex bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded h-[2.125rem]`}
          items={items}
          dropdownClassName="max-h-[20rem] max-w-[40vw]"
        >
          <span className="cursor-pointer" id="descriptionsList">
            <Dots />
          </span>
        </CustomDropdownButton>
        <CustomTooltip
          title={isDisabled ? t("general.notActive") : t("general.save")}
          className={`
                     bg-gray-gray3 flex justify-center items-center w-[2.125rem] h-[2.125rem] rounded
                      ${isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                    `}
        >
          <span
            onClick={() => {
              if (!isDisabled) {
                handleSaveDescription();
              }
            }}
          >
            <SavePlus
              config={{
                width: 18,
                height: 18,
                stroke: "black",
              }}
            />
          </span>
        </CustomTooltip>
      </div>
    </Form>
  );
};
