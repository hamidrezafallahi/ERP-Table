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
  CustomRadio,
  CustomTooltip,
  DynamicSelect,
} from '@components/atoms/defaultElements';
import {
  PlusOutline,
  SpinIcon,
} from '@components/atoms/iconComponents';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import type { IRequest } from '@services/com/goodExtraInfo/type';
import { transformDotNotationToNested } from '@utils/core';
import { showSuccessToast } from '@utils/toast';

enum fieldType {
  text = 1,
  date = 2,
  number = 3,
  boolean = 4,
}

export const FormUserReport = ({
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
  const { data: defaultValue } = useGetData<any[], IRequest>({
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

  const independentValue = Form.useWatch("type", form);

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
            ChangeFields: changeFields?.filter((item) => item !== "type"),
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
      form.setFieldValue("UserId", defaultValue?.Data[0]?.UserId);
      form.setFieldValue("RoleId", defaultValue?.Data[0]?.RoleId);
      if (defaultValue?.Data[0]?.UserId) {
        form.setFieldValue("type", true);
      } else {
        form.setFieldValue("type", false);
      }

      setOriginalValues(defaultValue?.Data[0]);
    }
  }, [defaultValue?.Data, form, id]);

  useEffect(() => {
    if (independentValue) {
      form.setFieldValue("RoleId", null);
    } else {
      form.setFieldValue("UserId", null);
    }
  }, [independentValue]);

  const options = [
    { caption: "کاربر", value: true },
    { caption: "نقش", value: false },
  ];

  return (
    <Form
      form={form}
      name="validateOnly"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col lg:grid lg:grid-cols-2 gap-2`}
    >
      <Form.Item label="نوع" name="type" className="!mb-0 !pb-0 text-xs">
        <Radio.Group
          name="formTypeClient"
          className="flex flex-wrap gap-4 w-full"
        >
          {options.map((option, index) => (
            <CustomRadio key={index} value={option.value}>
              {option.caption}
            </CustomRadio>
          ))}
        </Radio.Group>
        {/* <DynamicRadio
          item={{
            radioValues: [
              { caption: "کاربر", value: true },
              { caption: "نقش", value: false },
            ],
          }}
          config={{
            name: "",
            setFieldValue: form.setFieldValue,
          }}
        /> */}
      </Form.Item>
      {independentValue === true && (
        <Form.Item
          label="کاربر"
          name="UserId"
          // rules={[
          //   {
          //     required: true,
          //     message: "این فیلد الزامی است.",
          //   },
          // ]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={{
              endpoint: "api/auth/select/user4selectOption",
              repoViewId: 20016,
              addAppUrl: "string",
              addWebUrl: "string",
            }}
            showId
            showSearch
            allowClear
            infinite
          />
        </Form.Item>
      )}
      {independentValue === false && (
        <Form.Item
          label="نقش"
          name="RoleId"
          // rules={[
          //   {
          //     required: true,
          //     message: "این فیلد الزامی است.",
          //   },
          // ]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={{
              endpoint: "api/auth/select/role4selectOption",
              repoViewId: 20017,
              addAppUrl: "string",
              addWebUrl: "string",
            }}
            showId
            showSearch
            allowClear
            infinite
          />
        </Form.Item>
      )}

      <Form.Item className="col-span-2 m-0 p-0 text-xs">
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
