import React from "react";
import { Checkbox, Form, FormInstance, Radio, Spin } from "antd";
import { useTranslations } from "next-intl";
import { CustomButton } from "@components/atoms/defaultElements";
import { SpinIcon } from "@components/atoms/iconComponents";
import { useCUDDataMutation } from "@services/base";
import { useAppSelector } from "@redux/index";
import { ReloadType } from "../../types";
import { useFormChangeFields } from "@hooks/custom/useFormChangeFields";
import { checkboxItems } from "./content";
import { CurrencyReportEnum } from "./enum";

interface CustomFormProps {
  typeId: number;
  refetchCard: ReloadType;
  refetchTable: ReloadType;
  sidebarForm: FormInstance<any>;
}

export default function CustomForm(props: CustomFormProps) {
  const { typeId, refetchCard, refetchTable ,sidebarForm} = props;

  const t = useTranslations();
  const [form] = Form.useForm();
  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();
  const formValues = Form.useWatch([], form);
  const sidebarFormValues = Form.useWatch([], sidebarForm);

  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  });

  console.log({ formValues });
  console.log({ sidebarFormValues });

  const { reset } = useFormChangeFields(form, formValues);

  const handleSubmit = async (values: any) => {
    const simple = sidebarFormValues.reportType === "Simple"
    // const body = 
//       ShowMode: values,
// ShowInadept": true,
// ShowCreditor": true,
// ShowHasRemain": true,
// ShowHasNotRemain": true,
// ReportMode": "Groh",
// ColsType": "TwoCols",
// CurrencyReportType": "IsRial",isCurrency 
    
    // console.log("reyhan");
    // const body = isEdit
    //   ? {
    //       Desc: values.Desc,
    //       [config.idFieldKeyUpdate]: editingRecord?.[config.idFieldKeyUpdate],
    //       [config.fieldKey]: editingRecord?.[config.fieldKey],
    //       ChangeFields: changeFields,
    //     }
    //   : {
    //       Desc: values.Desc,
    //       [config.idFieldName]: typeId,
    //     };
    // const res = await mutateItem({
    //   url: isEdit ? config.updateUrl : config.createUrl,
    //   body,
    // }).unwrap();

    // if (res?.Result == "Success") {
    //   showSuccessToast(t("toast.successTitle"));
    //   form.resetFields();
    //   setEditingRecord(null);
    //   match ? refetchTable() : refetchCard();
    // }
  };

  return (
    <Form
      form={form}
      name="contextForm"
      layout="vertical"
      onFinish={handleSubmit}
      className="grid grid-cols-12 gap-4"
      initialValues={{
        ShowInadept: true,
        ShowCreditor: true,
        ShowHasRemain: true,
        ShowHasNotRemain: true,
      }}
    >
      <Form.Item
        name="CurrencyReportType"
        label="براساس"
        className="!mb-0 col-span-12 lg:col-span-6"
        initialValue={CurrencyReportEnum.IsRial}
        rules={[{ required: true, message: t("form.required") }]}
      >
        <Radio.Group className="flex justify-between">
          <Radio value={CurrencyReportEnum.IsRial}>ریال</Radio>
          <Radio value={CurrencyReportEnum.IsRefer}>تعداد</Radio>
          <Radio value={CurrencyReportEnum.IsCurrency}>عرض</Radio>
        </Radio.Group>
      </Form.Item>
      {/* <Form.Item
        name="docType"
        label="نوع سند"
        className="!mb-0 col-span-12 w-full lg:col-span-6"
        rules={[{ required: true, message: t("form.required") }]}
      >
        <DocType />
      </Form.Item> */}
      <div className="flex justify-between flex-wrap col-span-12">
        {checkboxItems.map((item) => (
          <Form.Item
            key={item.name}
            name={item.name}
            valuePropName="checked"
            className="m-0 p-0 text-xs"
          >
            <Checkbox defaultChecked>{item.label}</Checkbox>
          </Form.Item>
        ))}
      </div>
      <div className="col-span-12 flex items-end justify-end">
        <Form.Item className="m-0 p-0 text-xs">
          <CustomButton
            type="text"
            htmlType="submit"
            className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
          >
            {mutateIsLoading ? (
              <Spin size="large" indicator={<SpinIcon />} />
            ) : (
              t("general.show")
            )}
          </CustomButton>
        </Form.Item>
      </div>
    </Form>
  );
}
