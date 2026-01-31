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
import { useDispatch } from 'react-redux';

import {
  CustomButton,
  CustomTooltip,
  DynamicMultiSelect,
  DynamicSelect,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import { DynamicTree } from '@components/atoms/defaultElements/dynamicTree';
import InputNumber from '@components/atoms/defaultElements/inputNumber';
import InputText from '@components/atoms/defaultElements/inputText';
import { NewTimePicker } from '@components/atoms/defaultElements/newTimePicker';
import {
  PlusOutline,
  SpinIcon,
} from '@components/atoms/iconComponents';
import {
  apiService,
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import type { IRequestConfig } from '@type/elementType';
import {
  showSuccessToast,
  transformDotNotationToNested,
} from '@utils/core';

function combineValues(defaultValue, dateFields) {
  const finalObject = { ...defaultValue };

  dateFields.forEach((field) => {
    Object.keys(field).forEach((key) => {
      if (finalObject.hasOwnProperty(key)) {
        finalObject[key] = field[key];
      }
    });
  });

  return finalObject;
}

export const FormDynamicModal = ({
  formData,
  createUrl,
  updateUrl,
  id,
  sourceKey,
  sourceId,
  clearId,
  setPageNumber,
  config,
}) => {
  const { data: defaultValue } = useGetData<any, null>({
    url: config.listConfig.selectUrl,
    body: {
      ...config.listConfig.body,
      RepoViewId: config.listConfig.repoViewId,
      [sourceKey]: sourceId,
      Id: id,
    },
    skip: !id,
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const [changeFields, setChangeFields] = useState([]);
  const [originalValues, setOriginalValues] = useState(null);

  const dispatch = useDispatch();
  const t = useTranslations();
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);

  const formIsValid = formValues
    ? Object.values(formValues).every((value) => value !== undefined)
    : false;

  const handleSubmit = async (values) => {
    let formValues = values;

    if (
      formValues.Time !== undefined &&
      formValues.Time !== null &&
      formValues.Time !== ""
    ) {
      const clean = String(formValues.Time).replace(":", "."); // اگر با : وارد شده بود
      const parsed = parseFloat(clean);
      formValues.Time = isNaN(parsed) ? null : parsed;
    }

    const hasDateField = formData.find((item) => item.type === "date");
    if (hasDateField) {
      formValues = {
        ...values,
        [hasDateField.name]: values[hasDateField.name],
      };
    }
    const cleanValues = transformDotNotationToNested(formValues);
    try {
      let mutateResult;

      if (id) {
        mutateResult = await mutateItem({
          url: updateUrl,
          body: {
            ...cleanValues,
            [sourceKey]: sourceId,
            [config.fieldKey]: id,
            ChangeFields: changeFields,
          },
        }).unwrap();
      } else {
        mutateResult = await mutateItem({
          url: createUrl,
          body: { ...cleanValues, [sourceKey]: sourceId },
          [config.fieldKey]: id,
        }).unwrap();
      }
      if (mutateResult?.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        form.resetFields();

        (dispatch as any)(
          apiService.util.updateQueryData(
            "getInfinite",
            {
              url: config.listConfig.selectUrl,
              body: {
                RepoViewId: config.listConfig.repoViewId,
                [sourceKey]: id,
              },
              id: "All",
            },
            (draft) => {
              if (draft?.Data) draft.Data = [];
            },
            false
          )
        );

        setPageNumber(1);
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

    const hasDateFields = formData.filter((item) => item.type === "date");
    if (hasDateFields && hasDateFields.length > 0) {
      hasDateFields.map((item) => {
        form.setFieldValue(item.name, new Date());
      });
    }

    if (id && defaultValue?.Data) {
      const defaultValues = defaultValue?.Data[0];
      const hasDateFields = formData.filter((item) => item.type === "date");

      if (hasDateFields && hasDateFields.length > 0) {
        const dateFields = hasDateFields.map((item) => {
          return {
            [item.name]: new Date(defaultValues[item.name]),
          };
        });

        const combinedResult = combineValues(defaultValues, dateFields);

        form.setFieldsValue(combinedResult);
        setOriginalValues(combinedResult);
      } else {
        form.setFieldsValue(defaultValues);
        setOriginalValues(defaultValues);
      }
    }
  }, [defaultValue?.Data, form, id]);

  const renderField = (item) => {
    if (item.type === "date") {
      return <NewDatePicker defaultValue={new Date(formValues?.[item.name]).getTime()}  placeholder={t("general.chooseDate")} onChange={(e)=>{form.setFieldValue(item.name,e)} }/>;
    }

    if (item.type === "time") {
      return <NewTimePicker defaultValue={formValues?.[item.name]} />;
    }

    if (item.type === "checkbox") {
      return <Checkbox />;
    }

    if (item.type === "selectOption") {
      const dynamicValue: IRequestConfig = {
        ...item.selectEndpoint,
        addWebUrl: item.selectEndpoint?.addWebUrl,
        endpoint: item.selectEndpoint?.endpoint,
        repoViewId: item.selectEndpoint?.repoViewId,
        addButton: item.addButton,
      };
      return (
        <DynamicSelect
          dynamicValue={dynamicValue}
          showId
          showSearch
          allowClear
          infinite
        />
      );
    }
    if (item.type === "multiSelectOption") {
      const dynamicValue: IRequestConfig = {
        ...item.selectEndpoint,
        addWebUrl: item.selectEndpoint.addWebUrl,
        endpoint: item.selectEndpoint.endpoint,
        repoViewId: item.selectEndpoint.repoViewId,
        addButton: item.addButton,
      };
      return <DynamicMultiSelect dynamicValue={dynamicValue} />;
    }
    if (item.type === "treeOption") {
      const dynamicValue: IRequestConfig = {
        ...item.selectEndpoint,
        addWebUrl: item.selectEndpoint?.addWebUrl,
        endpoint: item.selectEndpoint?.endpoint,
        repoViewId: item.selectEndpoint?.repoViewId,
        addButton: item.addButton,
      };
      return <DynamicTree dynamicValue={dynamicValue} showSearch allowClear />;
    }
    if (item.type === "number") {
      return <InputNumber keyboard={false} controls={false} min={0} />;
    }

    if (item.type === "text" && item.name === "Time") {
      return (
        <InputText
          placeholder="مثلاً 10 یا 10.50"
          onKeyDown={(e) => {
            // اجازه فقط اعداد، نقطه، و کلیدهای کنترل
            if (
              !(
                (e.key >= "0" && e.key <= "9") ||
                e.key === "." ||
                [
                  "Backspace",
                  "Delete",
                  "ArrowLeft",
                  "ArrowRight",
                  "Tab",
                ].includes(e.key)
              )
            ) {
              e.preventDefault();
            }
          }}
          onBlur={(e) => {
            let val = e.target.value.trim();
            val = val.replace(/[^0-9.]/g, "");
            const parsed = parseFloat(val);
            form.setFieldValue("Time", isNaN(parsed) ? null : parsed);
          }}
          defaultValue={formValues?.[item.name]}
        />
      );
    }

    if (item.type === "price") {
      return (
        <InputNumber
          min={0}
          controls={false}
          parser={(value) =>
            value?.replace(/\$\s?|(,*)/g, "") as unknown as number
          }
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      );
    }

    return <InputText type={item.type} />;
  };

  return (
    <Form
      form={form}
      name="validateOnly"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col lg:grid lg:grid-cols-2 gap-2`}
    >
      {formData
        ?.filter((item) => item.type !== "info")
        .sort((a, b) => a.order - b.order)
        .map((item, index) =>
          item.type === "checkbox" ? (
            <Form.Item
              key={index}
              name={item.name}
              rules={item.rules}
              className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
              valuePropName="checked"
              initialValue={false}
            >
              <Checkbox>{item.caption}</Checkbox>
            </Form.Item>
          ) : (
            <Form.Item
              key={index}
              label={item.caption}
              name={item.name}
              rules={item.rules}
              className={`flex flex-col !mb-0 !pb-0 text-xs ${
                formData.length % 2 !== 0 &&
                index === formData.length - 1 &&
                "col-span-2"
              }`}
            >
              {renderField(item)}
            </Form.Item>
          )
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
