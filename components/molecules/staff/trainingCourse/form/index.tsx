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
  IStaffTrainingCourse,
} from '@services/hr/staffTrainingCourse/type';
import { transformDotNotationToNested } from '@utils/core';
import { showSuccessToast } from '@utils/toast';

export const FormTrainingCourse = ({
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
  const { data: defaultValue } = useGetData<IStaffTrainingCourse[], IRequest>({
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
      name="trainingCourse"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col px-2 gap-2`}
    >
      <div className="gap-1 grid grid-cols-4">
        <div className="col-span-2">
          <Form.Item
            label="دوره های آموزشی"
            name="TrainingCourseId"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <DynamicSelect
              dynamicValue={{
                endpoint: "/api/hr/select/trainingCourse4SelectOption",
                repoViewId: 60009,
              }}
            />
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="محل آموزش "
            name="EducationalInstitutionId"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <DynamicSelect
              dynamicValue={{
                endpoint: "/api/com/select/commonInfo/educationalInstitution",
                repoViewId: 0,
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
        <Form.Item
          label="ساعت آموزش"
          name="TrainingHours"
          // rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <CustomInputNumber controls={false} />
        </Form.Item>
        <Form.Item
          label="امتیاز"
          name="Score"
          // rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <CustomInputNumber controls={false} />
        </Form.Item>
        <div className="col-span-1">
          <Form.Item
            label="تاریخ موثر"
            name="EffectiveDate"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <NewDatePicker defaultValue={formValues?.EffectiveDate} />
          </Form.Item>
        </div>
        <div className="col-span-1">
          <Form.Item
            label="تاریخ ابطال"
            name="CancellationDate"
            // rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <NewDatePicker defaultValue={formValues?.CancellationDate} />
          </Form.Item>
        </div>
        <Form.Item
          label="نمره"
          name="Grade"
          // rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <CustomInputNumber controls={false} />
        </Form.Item>
        <Form.Item
          label="از نمره"
          name="FromGrade"
          // rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <CustomInputNumber controls={false} />
        </Form.Item>
        <Form.Item
          name="IsAccepted"
          rules={[]}
          className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          valuePropName="checked"
          initialValue={false}
        >
          <Checkbox>قبول</Checkbox>
        </Form.Item>
        <Form.Item
          label="ساعت مورد تایید"
          name="ApprovedTime"
          // rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <CustomInputNumber controls={false} />
        </Form.Item>
        <div className="col-span-2">
          <Form.Item
            label="محتوی دوره"
            name="CourseContent"
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
