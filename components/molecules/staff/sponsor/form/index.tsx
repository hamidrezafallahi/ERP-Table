import {
  useEffect,
  useState,
} from 'react';

import {
  Checkbox,
  Form,
  Radio,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  CustomTooltip,
  DynamicSelect,
  NewDatePicker,
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
import { IStaffSponsor } from '@services/hr/staffSponsor/type';
import type { IRequest } from '@services/hr/staffWorkHistory/type';
import { transformDotNotationToNested } from '@utils/core';
import { showSuccessToast } from '@utils/toast';

export const SponsorForm = ({
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
  const { data: defaultValue } = useGetData<IStaffSponsor[], IRequest>({
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
    } else {
      form.setFieldValue("MarriageStatId", 0);
    }
  }, [defaultValue?.Data, form, id]);

  return (
    <Form
      form={form}
      name="sponsorForm"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col px-2 gap-2`}
    >
      <div className="gap-1 grid grid-cols-4">
        <div className="col-span-2">
          <Form.Item
            label="نسبت"
            name="SponsorTypeId"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <DynamicSelect
              dynamicValue={{
                endpoint: "/api/com/select/commonInfo/relation",
                repoViewId: null,
              }}
            />
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="نام"
            name="SponsorFName"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="نام خانوادگی"
            name="SponsorLName"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="نام پدر"
            name="FatherName"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="تاریخ تولد"
            name="SponsorshipBirthDate"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <NewDatePicker defaultValue={formValues?.SponsorshipBirthDate} />
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="محل تولد"
            name="BirthLocationId"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <DynamicTree
              dynamicValue={{
                endpoint: "api/com/Select/Location4selectOption",
                repoViewId: 30040,
              }}
            />
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="محل صدور"
            name="ExportLocationId"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <DynamicTree
              dynamicValue={{
                endpoint: "api/com/Select/Location4selectOption",
                repoViewId: 30040,
              }}
            />
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="کد ملی"
            name="NationalityCode"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <CustomInputNumber controls={false} />
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="شماره شناسنامه"
            name="SponsorIdentityNumber"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <CustomInputNumber controls={false} />
          </Form.Item>
        </div>
        <div className="col-span-2">
          <Form.Item
            label="توضیحات"
            name="XtraDesc"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <InputText />
          </Form.Item>
        </div>

        <div className="flex justify-between items-center gap-2 col-span-2 p-2 border-2 border-gray-gray4 border-dashed">
          <Form.Item
            name="SponsorshipWorkingStat"
            rules={[]}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
            valuePropName="checked"
            initialValue={false}
          >
            <Checkbox>شاغل</Checkbox>
          </Form.Item>

          <div className="flex items-center gap-2">
            <span className="text-sm">وضعیت تاهل</span>
            <Form.Item
              // label="وضعیت تاهل"
              name="MarriageStatId"
              rules={[
                {
                  required: true,
                  message: "این فیلد الزامی است.",
                  type: "number",
                },
              ]}
              className="flex gap-2 !mb-0 !pb-0 text-xs"
            >
              <Radio.Group value={0} className="flex gap-4">
                <Radio value={1}>متاهل</Radio>
                <Radio value={0}>مجرد</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
        </div>
        <div className="flex justify-end items-center col-span-2">
          <Form.Item
            name="IsActive"
            rules={[]}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
            valuePropName="checked"
            initialValue={true}
          >
            <Checkbox>فعال</Checkbox>
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
