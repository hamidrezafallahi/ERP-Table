import { Checkbox, Form, Spin } from "antd";
import { useTranslations } from "next-intl";

import {
  CustomButton,
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import { DynamicTree } from "@components/atoms/defaultElements/dynamicTree";
import CustomInputNumber from "@components/atoms/defaultElements/inputNumber";
import InputText from "@components/atoms/defaultElements/inputText";
import { SpinIcon } from "@components/atoms/iconComponents";
import { useCUDDataMutation } from "@services/base";
import type { IRequestConfig } from "@type/elementType";
import {
  showErrorToast,
  showSuccessToast,
  transformDotNotationToNested,
} from "@utils/core";

import { ConditionalFields } from "./conditionalFields";
import type { IProps } from "./type";

export const ChequeDynamicForm = ({
  sourceKey,
  sourceId,
  handleClose,
  config,
  selectedRecords,
}: IProps) => {
  const createUrl = config.createUrl;
  const voucherTypeId = config.voucherTypeId;

  // const { data: defaultValue } = useGetData<null, null>({
  //   url: getUrl,
  //   body: {
  //     RepoViewId: repoViewId,
  //     [sourceKey]: sourceId,
  //     Id: id,
  //   },
  //   skip: !id,
  // });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  // const [changeFields, setChangeFields] = useState([]);
  // const [originalValues, setOriginalValues] = useState(null);
  const t = useTranslations();
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);

  const formIsValid = formValues
    ? Object.values(formValues).every((value) => value !== undefined)
    : false;

  const handleSubmit = async (values) => {
    const cleanValues = transformDotNotationToNested(values);
    let body = {
      ...cleanValues,
      [sourceKey]: sourceId,
      VoucherTypeId: voucherTypeId,
    };

    if (config?.alternativeKey) {
      const alternativeValue = selectedRecords.map((item) => {
        const key = config?.alternativeFindKey.split(".");
        let value = item;
        for (let i = 0; i < key.length; i++) {
          value = value[key[i]];
        }

        return value;
      });
      const validation = alternativeValue.every(
        (value) => value === alternativeValue[0]
      );
      validation
        ? (body = {
            ...body,
            [config.alternativeKey]: alternativeValue[0],
          })
        : showErrorToast(config?.alternativeErr, t("general.fail"));

      if (!validation) return;
    }

    try {
      // let mutateResult;

      // if (id) {
      //   mutateResult = await mutateItem({
      //     url: updateUrl,
      //     body: {
      //       ...cleanValues,
      //       Details: {

      //       }
      //       [sourceKey]: sourceId,
      //       [fieldKey]: id,
      //       ChangeFields: changeFields,
      //     },
      //   }).unwrap();
      // } else {

      const mutateResult = await mutateItem({
        url: createUrl,
        body: body,
        id: "all",
      }).unwrap();

      // }
      if (mutateResult?.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        form.resetFields();
        handleClose();
      }
    } catch (error) {
      null;
    }
  };

  // useEffect(() => {
  //   if (originalValues) {
  //     for (const key in formValues) {
  //       if (originalValues[key] !== formValues[key]) {
  //         const exist = changeFields.find((item) => item === key);

  //         if (!exist) {
  //           setChangeFields((prevState) => [...prevState, key]);
  //         }
  //       }
  //     }
  //   }
  // }, [formValues, originalValues]);

  // useEffect(() => {
  //   form.resetFields();
  //   setChangeFields([]);
  //   setOriginalValues(null);
  //   if (id && defaultValue?.Data) {
  //     form.setFieldsValue(defaultValue?.Data);
  //   }
  // }, [defaultValue?.Data, form, id]);

  const renderField = (item) => {
    if (item.type === "date") {
      // form.setFieldValue(item.name,new Date().toISOString())
      return <NewDatePicker />;
    }

    if (item.type === "checkbox") {
      return <Checkbox />;
    }

    if (item.type === "selectOption") {
      const dynamicValue: IRequestConfig = {
        addWebUrl: item.selectEndpoint?.addWebUrl,
        endpoint: item.selectEndpoint?.endpoint,
        repoViewId: item.selectEndpoint?.repoViewId,
      };
      return (
        <DynamicSelect
          dynamicValue={dynamicValue}
          config={{
            name: item.name,
            setFieldValue: form.setFieldValue,
          }}
          showId
          showSearch
          allowClear
          infinite
        />
      );
    }
    if (item.type === "treeOption") {
      const dynamicValue: IRequestConfig = {
        addWebUrl: item.selectEndpoint?.addWebUrl,
        endpoint: item.selectEndpoint?.endpoint,
        repoViewId: item.selectEndpoint?.repoViewId,
        addButton: item.addButton,
      };
      return <DynamicTree dynamicValue={dynamicValue} showSearch allowClear />;
    }
    if (item.type === "number") {
      return <CustomInputNumber keyboard={false} controls={false} min={0} />;
    }
    if (item.type === "price") {
      return (
        <CustomInputNumber
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
      name="chequeDynamicForm"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col lg:grid lg:grid-cols-2 gap-2 h-full`}
    >
      {config.formFields
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
                config.formFields.length % 2 !== 0 &&
                index === config.formFields.length - 1 &&
                "col-span-2"
              }`}
            >
              {renderField(item)}
            </Form.Item>
          )
        )}
      {config.conditionalFields && <ConditionalFields form={form} />}
      <Form.Item className="col-span-2 m-0 p-0 text-xs">
        <div className="flex justify-end items-end gap-2 pt-2">
          <CustomButton
            type="text"
            htmlType="submit"
            // disabled={id ? changeFields.length === 0 : !formIsValid}
            disabled={!formIsValid}
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
