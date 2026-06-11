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
import { transformDotNotationToNested } from "@utils/core";
import { showErrorToast, showSuccessToast } from "@utils/toast";
import { ConditionalFields } from "./conditionalFields";
import type { IProps } from "./type";
import { useMemo } from "react";

export const ChequeDynamicForm = ({
  sourceKey,
  sourceId,
  handleClose,
  config,
  selectedRecords,
  type,
}: IProps) => {
  const createUrl = config?.createUrl;
  const voucherTypeId = config?.voucherTypeId;
  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();
  const t = useTranslations();
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);

  const formIsValid =
    formValues &&
    form.isFieldsTouched(true) &&
    form.getFieldsError().every(({ errors }) => errors.length === 0);

  const resolveAlternativeKey = () => {
    if (!config?.alternativeKey) return {};
    const values = selectedRecords.map((item) => {
      const keys = config.alternativeFindKey.split(".");
      return keys.reduce((acc, key) => acc?.[key], item);
    });
    const isValid = values.every((v) => v === values[0]);
    if (!isValid) {
      showErrorToast(config.alternativeErr, t("general.fail"));
      return null;
    }
    return { [config.alternativeKey]: values[0] };
  };

  const handleSubmit = async (values) => {
    const cleanValues = transformDotNotationToNested(values);
    const alternative = resolveAlternativeKey();
    if (alternative === null) return;
    const body = {
      ...cleanValues,
      ...alternative,
      [sourceKey]: sourceId,
      VoucherTypeId: voucherTypeId,
    };
    try {
      const mutateResult = await mutateItem({
        url: createUrl,
        body: body,
        id: "all",
      }).unwrap();
      if (mutateResult?.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        form.resetFields();
        handleClose();
      }
    } catch (error) {
      showErrorToast(t("general.fail"));
    }
  };

  const sortedFields = useMemo(() => {
    return [...(config.formFields ?? [])]
      .filter((item) => item.type !== "info")
      .sort((a, b) => a.order - b.order);
  }, [config.formFields]);

  const fieldRenderers = useMemo(
    () => ({
      date: () => <NewDatePicker />,
      checkbox: () => <Checkbox />,
      number: () => (
        <CustomInputNumber keyboard={false} controls={false} min={0} />
      ),
      price: () => (
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
      ),
    }),
    [],
  );

  const renderField = (item) => {
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
    return fieldRenderers[item.type]?.() ?? <InputText type={item.type} />;
  };


  return (
    <Form
      form={form}
      name="chequeDynamicForm"
      layout="vertical"
      onFinish={handleSubmit}
      className="flex flex-col lg:grid lg:grid-cols-2 gap-2 h-full items-center"
    >
      {sortedFields.map((item, index) =>
        item.type === "checkbox" ? (
          <Form.Item
            key={item.name}
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
            key={item.name}
            label={item.caption}
            name={item.name}
            rules={item.rules}
            className={`flex flex-col !mb-0 !pb-0 text-xs ${
              config.formFields.length % 2 !== 0 &&
              index === config.formFields.length - 1 &&
              !config.conditionalFields &&
              "col-span-2"
            }`}
          >
            {renderField(item)}
          </Form.Item>
        ),
      )}
      {config.conditionalFields && (
        <ConditionalFields form={form} type={type} />
      )}
      <Form.Item className="col-span-2 m-0 p-0 text-xs">
        <div className="flex justify-end items-end gap-2 pt-2">
          <CustomButton
            type="text"
            htmlType="submit"
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
