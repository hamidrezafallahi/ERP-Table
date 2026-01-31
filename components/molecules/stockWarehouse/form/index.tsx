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
  IRequest,
  IStockWarehouse,
} from '@services/inv/stockWarehouse/type';
import {
  showSuccessToast,
  transformDotNotationToNested,
} from '@utils/core';

enum fieldType {
  manual = 1,
  XYZ = 2,
}

export const FormStockWarehouse = ({
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
  const { data: defaultValue } = useGetData<IStockWarehouse[], IRequest>({
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
  const type = Form.useWatch("type", form);

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
      form.setFieldValue("type", fieldType.manual);
      form.setFieldsValue(defaultValue?.Data[0]);
    } else {
      form.setFieldValue("type", fieldType.manual);
    }
  }, [defaultValue?.Data, form, id]);

  return (
    <Form
      form={form}
      name="stockWarehouse"
      layout="horizontal"
      onFinish={handleSubmit}
      className={`flex flex-col px-2 gap-2`}
    >
      <Form.Item
        label="نوع"
        name="type"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "number" },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <Radio.Group
          value={fieldType.manual}
          className="flex gap-16"
          disabled={!!id}
        >
          <Radio value={fieldType.manual}>دستی</Radio>
          <Radio value={fieldType.XYZ}>X.Y.Z</Radio>
        </Radio.Group>
      </Form.Item>
      {type === fieldType.manual ? (
        <Form.Item
          label="عنوان"
          rules={[{ required: true, message: t("form.required") }]}
          name="StockLocationDesc"
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <InputText />
        </Form.Item>
      ) : (
        <>
          <div className="gap-1 grid grid-cols-3">
            <div className="col-span-2">
              <Form.Item
                label="X"
                name="StockLocationDesc1"
                rules={[{ required: true, message: t("form.required") }]}
                className="flex flex-col !mb-0 !pb-0 text-xs"
              >
                <InputText />
              </Form.Item>
            </div>
            <Form.Item
              label="تعداد"
              name="Quantity1"
              rules={[{ required: true, message: t("form.required") }]}
              className="flex flex-col !mb-0 !pb-0 text-xs"
            >
              <CustomInputNumber controls={false} />
            </Form.Item>
          </div>
          <div className="gap-1 grid grid-cols-3">
            <div className="col-span-2">
              <Form.Item
                label="Y"
                name="StockLocationDesc2"
                rules={[{ required: true, message: t("form.required") }]}
                className="flex flex-col !mb-0 !pb-0 text-xs"
              >
                <InputText />
              </Form.Item>
            </div>
            <Form.Item
              label="تعداد"
              name="Quantity2"
              rules={[{ required: true, message: t("form.required") }]}
              className="flex flex-col !mb-0 !pb-0 text-xs"
            >
              <CustomInputNumber controls={false} />
            </Form.Item>
          </div>
          <div className="gap-1 grid grid-cols-3">
            <div className="col-span-2">
              <Form.Item
                label="Z"
                name="StockLocationDesc3"
                className="flex flex-col !mb-0 !pb-0 text-xs"
              >
                <InputText />
              </Form.Item>
            </div>
            <Form.Item
              label="تعداد"
              name="Quantity3"
              className="flex flex-col !mb-0 !pb-0 text-xs"
            >
              <CustomInputNumber controls={false} />
            </Form.Item>
          </div>
        </>
      )}

      <Form.Item className="col-span-2 m-0 p-0 text-xs">
        <div className="flex justify-between items-center gap-2 pt-2">
          <span className="text-blue-blue6 text-xs">
            * توجه داشته باشید، امکان ویرایش اطلاعات در حالت X.Y.Z وجود ندارد.
          </span>
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
        </div>
      </Form.Item>
    </Form>
  );
};
