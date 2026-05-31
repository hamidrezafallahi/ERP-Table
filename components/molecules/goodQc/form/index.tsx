import {
  useEffect,
  useState,
} from 'react';

import {
  Form,
  Radio,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import { DynamicTree } from '@components/atoms/defaultElements/dynamicTree';
import CustomInputNumber from '@components/atoms/defaultElements/inputNumber';
import InputText from '@components/atoms/defaultElements/inputText';
import {
  PlusOutline,
  SpinIcon,
} from '@components/atoms/iconComponents';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import type {
  IGoodQc,
  IRequest,
} from '@services/com/goodQc/type';
import { transformDotNotationToNested } from '@utils/core';
import { showSuccessToast } from '@utils/toast';

enum fieldType {
  numeric = 1,
  unNumeric = 2,
}

export const FormGoodQc = ({
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
  const { data: defaultValue } = useGetData<IGoodQc[], IRequest>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      [sourceKey]: sourceId,
      Id: id,
    },
    skip: !id,
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const [changeFields, setChangeFields] = useState([]);
  const [originalValues, setOriginalValues] = useState(null);

  const t = useTranslations();
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);
  const type = Form.useWatch("ParameterType", form);

  const formIsValid = formValues
    ? Object.values(formValues).every((value) => value !== undefined)
    : false;

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
    } else {
      form.setFieldValue("ParameterType", fieldType.numeric);
    }
  }, [defaultValue?.Data, form, id]);

  return (
    <Form
      form={form}
      name="goodQc"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col lg:grid lg:grid-cols-4 gap-2`}
    >
      <Form.Item
        label="نوع"
        name="ParameterType"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "number" },
        ]}
        className="flex flex-col col-span-4 !mb-0 !pb-0 text-xs"
      >
        <Radio.Group
          value={fieldType.numeric}
          className="flex gap-16"
          disabled={!!id}
        >
          <Radio value={fieldType.numeric}>کمی</Radio>
          <Radio value={fieldType.unNumeric}>وصفی</Radio>
        </Radio.Group>
      </Form.Item>
      {type === fieldType.unNumeric ? (
        <>
          <Form.Item
            label="عنوان پارامتر کلی"
            name="ParameterName"
            className="flex flex-col col-span-2 !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
          <Form.Item
            label="شرایط پذیرش"
            name="AdmissionRequirements"
            className="flex flex-col col-span-2 !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </>
      ) : (
        <>
          <Form.Item
            label="عنوان پارامتر کنترلی"
            name="ParameterName"
            className="flex flex-col col-span-2 !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>

          <Form.Item
            label="واحد اندازه گیری"
            name="MeasureUnitId"
            className="flex flex-col col-span-2 !mb-0 !pb-0 text-xs"
          >
            <DynamicTree
              dynamicValue={{
                endpoint: "api/com/select/measureUnit4SelectOption",
                repoViewId: null,
              }}
            />
          </Form.Item>
          <Form.Item
            label="مقدار هدف"
            name="Target"
            className="flex flex-col col-span-2 !mb-0 !pb-0 text-xs"
          >
            <CustomInputNumber controls={false} />
          </Form.Item>
          <Form.Item
            label="حد بالا"
            name="UpperLimit"
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <CustomInputNumber controls={false} />
          </Form.Item>
          <Form.Item
            label="حد پایین"
            name="LowerLimit"
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <CustomInputNumber controls={false} />
          </Form.Item>
        </>
      )}

      <Form.Item className="col-span-4 m-0 p-0 text-xs">
        <div className="flex justify-end items-center gap-2 pt-2">
          <CustomTooltip title={t("general.addNew")}>
            <span
              className="bg-gray-gray3 px-2 py-[2.8px] rounded cursor-pointer"
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
            disabled={id ? changeFields.length === 0 : !formIsValid}
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
