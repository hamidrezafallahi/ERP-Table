import { useEffect, useState } from "react";

import { Form, Spin } from "antd";
import { useTranslations } from "next-intl";

import { CustomButton, CustomTooltip } from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";
import { PlusOutline, SpinIcon } from "@components/atoms/iconComponents";
import { useCUDDataMutation, useGetData } from "@services/base";
import { IActParam, IRequest } from "@services/hr/actParam/type";
import { showSuccessToast, transformDotNotationToNested } from "@utils/core";

export const FormulaParameterForm = ({
  locale,
  createUrl,
  updateUrl,
  id,
  sourceKey,
  fieldKey,
  sourceId,
  clearId,
  getUrl,
  repoViewId,
}) => {
  const { data: defaultValue } = useGetData<IActParam[], IRequest>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      [sourceKey]: sourceId,
      ActParamId: id,
    },
    skip: !id,
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const [changeFields, setChangeFields] = useState([]);
  const [originalValues, setOriginalValues] = useState(null);

  const t = useTranslations();
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);

  const handleSubmit = async (values) => {
    const cleanValues = transformDotNotationToNested(values);

    try {
      let mutateResult;

      if (id) {
        mutateResult = await mutateItem({
          url: updateUrl,
          body: {
            ...cleanValues,

            [sourceKey]: sourceId,
            [fieldKey]: id,
            ChangeFields: changeFields,
          },
        }).unwrap();
      } else {
        mutateResult = await mutateItem({
          url: createUrl,
          body: {
            ...cleanValues,

            [sourceKey]: sourceId,
          },

          [fieldKey]: id,
        }).unwrap();
      }
      if (mutateResult?.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        form.resetFields();
      }
    } catch (error) {
      null;
    }
  };

  useEffect(() => {
    if (originalValues) {
      for (const key in formValues) {
        if (originalValues[key] !== formValues[key]) {
          const exist = changeFields.find((item) => item === key);

          if (!exist) {
            setChangeFields((prevState) => [...prevState, key]);
          }
        }
      }
    }
  }, [formValues, originalValues]);

  useEffect(() => {
    form.resetFields();
    setChangeFields([]);
    setOriginalValues(null);
    if (id && defaultValue?.Data) {
      form.setFieldsValue(defaultValue?.Data[0]);
      setOriginalValues(defaultValue?.Data[0]);
    }
  }, [defaultValue?.Data, form, id]);

  return (
    <Form
      form={form}
      name="formulaParameterForm"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col px-2 gap-2`}
    >
      <div className="gap-2 grid grid-cols-4 pb-8">
        <div className="col-span-2">
          <Form.Item
            label="عنوان"
            name="Title"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="شرح"
            name="Desc"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>
      </div>

      <Form.Item className="col-span-2 m-0 p-0 text-xs">
        <div className="flex justify-end items-center gap-2">
          <CustomTooltip title={t("general.addNew")}>
            <span
              className="px-2 py-[2.8px] bg-gray-gray3 rounded cursor-pointer"
              onClick={() => {
                clearId();
                form.resetFields();
              }}
            >
              <PlusOutline />
            </span>
          </CustomTooltip>

          <CustomButton
            type="text"
            htmlType="submit"
            // disabled={id ? changeFields.length === 0 : !formIsValid}
            className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
          >
            {mutateIsLoading ? (
              <Spin size="large" indicator={<SpinIcon />} />
            ) : (
              t("general.submit")
            )}
          </CustomButton>
        </div>
      </Form.Item>
    </Form>
  );
};
