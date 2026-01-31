import {
  useEffect,
  useState,
} from 'react';

import {
  Checkbox,
  Form,
  Spin,
} from 'antd';
import dayjs from 'dayjs';
import moment from 'moment-jalaali';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  CustomTooltip,
  DynamicSelect,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import InputNumber from '@components/atoms/defaultElements/inputNumber';
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
  IGoodExtraInfo,
  IGoodExtraInfoSelect,
  IRequest,
} from '@services/com/goodExtraInfo/type';
import type { IRequestConfig } from '@type/elementType';
import {
  showSuccessToast,
  transformDotNotationToNested,
} from '@utils/core';

enum fieldType {
  text = 1,
  date = 2,
  number = 3,
  boolean = 4,
}

export const FormGoodExtraInfo = ({
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
  const extraInfoDynamicValue: IRequestConfig = {
    endpoint: "/api/com/select/goodsExtraInfo4SelectOption",
  };

  const { data: defaultValue } = useGetData<IGoodExtraInfo[], IRequest>({
    url: getUrl,
    body: {
      RepoViewId: repoViewId,
      [sourceKey]: sourceId,
      Id: id,
    },
    skip: !id,
  });

  const { data: independent } = useGetData<IGoodExtraInfoSelect[], IRequest>({
    url: "api/com/select/goodsExtraInfo",
    body: {
      RepoViewId: 30030,
    },
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const [changeFields, setChangeFields] = useState([]);
  const [originalValues, setOriginalValues] = useState(null);
  const [independentValue, setIndependentValue] = useState<number>();

  const t = useTranslations();
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);

  const independentKey = Form.useWatch("GoodsExtraInfoId", form);
  const dependentKey = Form.useWatch("GoodsExtraInfoValue", form);

  const renderField = (value) => {
    if (value === fieldType.text) {
      return <InputText />;
    }
    if (value === fieldType.date) {
      const validDate = form.getFieldValue("GoodsExtraInfoValue");
      if (typeof validDate === "string" || typeof validDate === "number") {
        const date = new Date(
          moment(validDate, "jYYYY-jMM-jDD").format()
        ).toISOString();
        form.setFieldValue("GoodsExtraInfoValue", dayjs(date));
      }
      return <NewDatePicker />;
    }
    if (value === fieldType.number) {
      return (
        <InputNumber keyboard={false} controls={false} min={0} stringMode />
      );
    }
    if (value === fieldType.boolean) {
      return (
        <Checkbox
          checked={dependentKey === "بلی" ? true : false}
          onChange={(e) => {
            if (e.target.checked) {
              form.setFieldValue("GoodsExtraInfoValue", "بلی");
            } else {
              form.setFieldValue("GoodsExtraInfoValue", "خیر");
            }
          }}
        >
          مقدار
        </Checkbox>
      );
    }
  };

  const formIsValid = formValues
    ? Object.values(formValues).every((value) => value !== undefined)
    : false;

  const handleSubmit = async (values) => {
    const cleanValues = transformDotNotationToNested(values);

    let dependentValue = cleanValues?.GoodsExtraInfoValue;
    if (independentValue === fieldType.date) {
      let dateStringValue;
      if (locale === "fa") {
        dateStringValue = moment(dependentValue.toISOString())
          .locale("fa")
          .format("jYYYY/jMM/jDD");
      } else {
        const options: Intl.DateTimeFormatOptions = {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          timeZone: locale || Intl.DateTimeFormat().resolvedOptions().locale,
        };
        dateStringValue = new Intl.DateTimeFormat(locale, options).format(
          dependentValue.toISOString()
        );
      }
      dependentValue = dateStringValue;
    }

    try {
      let mutateResult;

      if (id) {
        mutateResult = await mutateItem({
          url: updateUrl,
          body: {
            // ...cleanValues,
            GoodsExtraInfoId: cleanValues?.GoodsExtraInfoId,
            GoodsExtraInfoValue: dependentValue,
            [sourceKey]: sourceId,
            [fieldKey]: id,
            ChangeFields: changeFields,
          },
        }).unwrap();
      } else {
        mutateResult = await mutateItem({
          url: createUrl,
          body: {
            // ...cleanValues,
            GoodsExtraInfoId: cleanValues?.GoodsExtraInfoId,
            GoodsExtraInfoValue: dependentValue,
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
      form.setFieldValue(
        "GoodsExtraInfoId",
        defaultValue?.Data[0]?.GoodsExtraInfoId
      );

      if (independentValue === fieldType.date) {
        if (id && defaultValue?.Data[0]?.GoodsExtraInfoValue) {
          const dateValue = defaultValue?.Data[0]?.GoodsExtraInfoValue;

          const date = new Date(
            moment(dateValue, "jYYYY-jMM-jDD").format()
          ).toISOString();
          form.setFieldValue("GoodsExtraInfoValue", dayjs(date));
        }
      } else {
        form.setFieldValue(
          "GoodsExtraInfoValue",
          defaultValue?.Data[0]?.GoodsExtraInfoValue
        );
      }
    } else {
      if (independentValue === fieldType.boolean) {
        form.setFieldValue("GoodsExtraInfoValue", "خیر");
      } else if (independentValue === fieldType.date) {
        const today = dayjs();
        form.setFieldValue("GoodsExtraInfoValue", today);
      } else if (independentValue === fieldType.number) {
        form.setFieldValue("GoodsExtraInfoValue", 0);
      } else {
        form.setFieldValue("GoodsExtraInfoValue", "");
      }
    }
  }, [defaultValue?.Data, form, id]);

  useEffect(() => {
    if (independent?.Result === "Success") {
      const exactItem = independent?.Data?.find(
        (item) => item?.GoodsExtraInfoId === independentKey
      );
      setIndependentValue(exactItem?.Type);
    }
  }, [independentKey, independent]);

  return (
    <Form
      form={form}
      name="validateOnly"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col lg:grid lg:grid-cols-2 gap-2`}
    >
      <Form.Item
        label="نوع اطلاعات"
        name="GoodsExtraInfoId"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "number" },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={extraInfoDynamicValue}
          showId
          showSearch
          allowClear
          infinite
          onChange={() => {
            form.setFieldValue("GoodsExtraInfoValue", undefined);
          }}
        />
      </Form.Item>
      {independentValue && (
        <Form.Item
          label="مقدار"
          name="GoodsExtraInfoValue"
          // rules={[
          //   {
          //     required: true,
          //     message: "این فیلد الزامی است.",
          //   },
          // ]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          {renderField(independentValue)}
        </Form.Item>
      )}

      <Form.Item className="col-span-2 m-0 p-0 text-xs">
        <div className="flex justify-end items-center gap-2 pt-2">
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
