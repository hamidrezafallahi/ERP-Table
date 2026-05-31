import {
  useEffect,
  useState,
} from 'react';

import {
  Form,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  CustomTooltip,
  DynamicSelect,
  NewDatePicker,
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
  IStaffSpecialServices,
} from '@services/hr/staffSpecialServices/type';
import { transformDotNotationToNested } from '@utils/core';
import { showSuccessToast } from '@utils/toast';

export const SpecialServicesForm = ({
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
  const { data: defaultValue } = useGetData<IStaffSpecialServices[], IRequest>({
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
      name="specialServicesForm"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col px-2 gap-2`}
    >
      <div className="gap-1 grid grid-cols-4">
        <div className="col-span-2">
          <Form.Item
            label="نوع برجستگی"
            name="ServiceTypeId"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <DynamicSelect
              dynamicValue={{
                endpoint: "/api/com/select/commonInfo/prominence",
                repoViewId: null,
              }}
            />
          </Form.Item>
        </div>
        <div className="col-span-1">
          <Form.Item
            label="تاریخ شروع"
            name="StartDate"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <NewDatePicker defaultValue={formValues?.StartDate} />
          </Form.Item>
        </div>
        <div className="col-span-1">
          <Form.Item
            label="تاریخ پایان"
            name="EndDate"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <NewDatePicker defaultValue={formValues?.EndDate} />
          </Form.Item>
        </div>
        <div className="col-span-1">
          <Form.Item
            label="شماره نامه تاییدیه"
            name="ConfirmationNumber"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>
        <div className="col-span-1">
          <Form.Item
            label="تاریخ نامه تاییدیه"
            name="ConfirmationDate"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <NewDatePicker defaultValue={formValues?.ConfirmationDate} />
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="ارگان تایید کننده"
            name="ConfirmingAuthority"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>
        <div className="col-span-1">
          <Form.Item
            label="مدت به ماه"
            name="DurationInMonths"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>

        <div className="col-span-1">
          <Form.Item
            label="محل وقوع"
            name="LocationOfOccurrence"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>
        <div className="col-span-1">
          <Form.Item
            label="درصد معلولیت"
            name="DisabilityPercentage"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>
        <div className="col-span-1">
          <Form.Item
            label="امتیاز"
            name="Score"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <CustomInputNumber controls={false} />
          </Form.Item>
        </div>
        <Form.Item
          label="امتیاز ابطال"
          name="SacrificeScore"
          // rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <InputText />
        </Form.Item>
        <div className="col-span-1">
          <Form.Item
            label="تاریخ ابطال"
            name="SacrificeDate"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <NewDatePicker defaultValue={formValues?.SacrificeDate} />
          </Form.Item>
        </div>
      </div>

      <Form.Item className="col-span-2 m-0 p-0 text-xs">
        <div className="flex justify-end items-center gap-2">
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
