import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Form, Spin } from "antd";
import { useTranslations } from "next-intl";
import { CustomButton, CustomTooltip } from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";
import { PlusOutline, SpinIcon } from "@components/atoms/iconComponents";
import { useCUDDataMutation, useGetData } from "@services/base";
import { FormInstance } from "antd/lib";
import { IDynamicModalConfig, RecordType } from "../../type";
import { showSuccessToast } from "@utils/core";

interface CustomFormProps {
  form: FormInstance<any>;
  typeId: number;
  config: IDynamicModalConfig;
  editingRecord: RecordType;
  setEditingRecord: Dispatch<SetStateAction<RecordType>>;
}

export default function CustomForm({
  form,
  config,
  typeId,
  editingRecord,
  setEditingRecord,
}: CustomFormProps) {
  const t = useTranslations();
  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();
  const [originalValues, setOriginalValues] = useState(null);
  const [changeFields, setChangeFields] = useState<string[]>([]);
  const formValues = Form.useWatch([], form);
  const isEdit = !!editingRecord;

  useEffect(() => {
    if (editingRecord) {
      form.setFieldsValue({ Desc: editingRecord.Desc });
      setOriginalValues({ Desc: editingRecord.Desc });
      setChangeFields([]);
    } else {
      form.resetFields();
      setOriginalValues(null);
      setChangeFields([]);
    }
  }, [editingRecord, form]);

  useEffect(() => {
    if (!originalValues) return;
    if (!formValues) return;
    for (const key in formValues) {
      if (originalValues[key] !== formValues[key]) {
        if (!changeFields.includes(key)) {
          setChangeFields((prev) => [...prev, key]);
        }
      }
    }
  }, [formValues, originalValues, changeFields]);

  const { refetch: ReLoad } = useGetData({
    url: config.listConfig.selectUrl,
    body: {
      RepoId: 0,
    },
  });

  const handleSubmit = async (values: any) => {
    const body = isEdit
      ? {
          Desc: values.Desc,
          [config.idFieldKeyUpdate]: editingRecord?.[config.idFieldKeyUpdate],
          [config.fieldKey]: editingRecord?.[config.fieldKey],
          ChangeFields: changeFields,
        }
      : {
          Desc: values.Desc,
          [config.idFieldName]: typeId,
        };
    const res = await mutateItem({
      url: isEdit ? config.updateUrl : config.createUrl,
      body,
    }).unwrap();

    if (res?.Result == "Success") {
      showSuccessToast(t("toast.successTitle"));
      form.resetFields();
      setEditingRecord(null);
      ReLoad();
    }
  };

  return (
    <>
      <Form
        form={form}
        name="validateOnly"
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="شرح"
          name="Desc"
          className="flex flex-col w-full text-xs"
          rules={[{ required: true, message: t("form.required") }]}
        >
          <InputText />
        </Form.Item>
        <Form.Item className="col-span-12 lg:col-span-3 m-0 p-0 text-xs">
          <div className="flex justify-end items-center gap-2 pt-1 w-full">
            <CustomTooltip title={t("general.addNew")}>
              <span
                className="px-2 py-[2.8px] bg-gray-gray3 rounded cursor-pointer"
                onClick={() => {
                  form.resetFields();
                  setEditingRecord(null);
                }}
              >
                <PlusOutline />
              </span>
            </CustomTooltip>
            <CustomButton
              type="text"
              htmlType="submit"
              className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
            >
              {mutateIsLoading ? (
                <Spin size="large" indicator={<SpinIcon />} />
              ) : isEdit ? (
                t("general.update")
              ) : (
                t("general.submit")
              )}
            </CustomButton>
          </div>
        </Form.Item>
      </Form>
    </>
  );
}
