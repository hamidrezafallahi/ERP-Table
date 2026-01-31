import {
  useEffect,
  useState,
} from 'react';

import {
  Checkbox,
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
  IStaffWorkHistory,
} from '@services/hr/staffWorkHistory/type';
import {
  showSuccessToast,
  transformDotNotationToNested,
} from '@utils/core';

export const WorkHistoryForm = ({
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
  const { data: defaultValue } = useGetData<IStaffWorkHistory[], IRequest>({
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
      name="workHistoryForm"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col px-2 gap-2`}
    >
      <div className="gap-1 grid grid-cols-4">
        <div className="col-span-2">
          <Form.Item
            label="نوع استخدام"
            name="EmploymentTypeId"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <DynamicSelect
              dynamicValue={{
                endpoint: "/api/com/select/commonInfo/employment",
              }}
            />
          </Form.Item>
        </div>
        <div className="col-span-1">
          <Form.Item
            label="تاریخ ابلاغ"
            name="NotificationDate"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <NewDatePicker defaultValue={formValues?.NotificationDate} />
          </Form.Item>
        </div>
        <Form.Item
          label="شماره ابلاغ"
          name="NotificationNumber"
          // rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <InputText />
        </Form.Item>
        <div className="col-span-2">
          <Form.Item
            label="نام شرکت"
            name="CompanyName"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>
        <div className="flex justify-between items-center gap-2 col-span-2 mt-2 p-1 border-2 border-gray-gray4 border-dashed">
          <Form.Item
            name="IsPrivateCompany"
            rules={[]}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox>شرکت خصوصی</Checkbox>
          </Form.Item>
          <Form.Item
            name="IsNonOrganizational"
            rules={[]}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox>غیر مرتبط با سازمان</Checkbox>
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="آخرین حقوق"
            name="LastSalary"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="آخرین سمت"
            name="LastPosition"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>
        <div className="col-span-1">
          <Form.Item
            label="تاریخ شروع"
            name="FromDate"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <NewDatePicker defaultValue={formValues?.FromDate} />
          </Form.Item>
        </div>
        <div className="col-span-1">
          <Form.Item
            label="تاریخ پایان"
            name="ToDate"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <NewDatePicker defaultValue={formValues?.ToDate} />
          </Form.Item>
        </div>
        <div className="flex justify-between items-center gap-2 col-span-2">
          <Form.Item
            label="سال مورد قبول"
            name="AcceptedYears"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
          <Form.Item
            label="ماه مورد قبول"
            name="AcceptedMonths"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
          <Form.Item
            label="روز مورد قبول"
            name="AcceptedDays"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="استقرار سنوات"
            name="SeniorityEstablishment"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="علت ترک کار"
            name="LeaveReason"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>
        <div className="flex justify-between items-center gap-2 col-span-2">
          <Form.Item
            label="جمع سال"
            name="TotalYears"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
          <Form.Item
            label="جمع ماه"
            name="TotalMonths"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
          <Form.Item
            label="جمع روز"
            name="TotalDays"
            // rules={[{ required: true, message: t("form.required") }]}
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
