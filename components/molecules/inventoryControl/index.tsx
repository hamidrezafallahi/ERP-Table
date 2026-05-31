import {
  useEffect,
  useRef,
} from 'react';

import {
  Form,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  DynamicSelect,
} from '@components/atoms/defaultElements';
import CustomInputNumber from '@components/atoms/defaultElements/inputNumber';
import { SpinIcon } from '@components/atoms/iconComponents';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import type {
  IGood,
  IRequest,
} from '@services/com/good/type';
import { showSuccessToast } from '@utils/toast';

export const InventoryControl = ({ handleClose, sourceKey, id }) => {
  const { data: defaultValue } = useGetData<IGood[], IRequest>({
    url: "api/com/select/goods",
    body: {
      RepoViewId: 30023,
      // [sourceKey]: id,
      Id: id,
    },
    skip: !id,
  });

  const inventoryTypeConfig = {
    endpoint: "api/inv/select/inventory4selectOption",
    repoViewId: 70011,
  };

  const measureUnitConfig = {
    endpoint: "api/com/select/measureUnit4SelectOption",
    repoViewId: null,
  };

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const t = useTranslations();
  const [form] = Form.useForm();

  const initialValuesRef = useRef<any>(null);

  const handleSubmit = async (values) => {
    const changedFields: string[] = [];

    Object.keys(values).forEach((key) => {
      if (values[key] !== initialValuesRef.current?.[key]) {
        changedFields.push(key);
      }
    });
    try {
      if (id) {
        const mutateResult = await mutateItem({
          url: "api/com/update/goods/inventoryControl",
          body: {
            ...values,
            [sourceKey]: id,
            // RepoViewId: 30089,
            ChangeFields: changedFields,
          },
        }).unwrap();
        if (mutateResult?.Result === "Success") {
          showSuccessToast(t("toast.successTitle"));
        }
      }

      handleClose();
    } catch (error) {
      null;
    }
  };

  useEffect(() => {
    if (defaultValue) {
      const data = defaultValue?.Data?.[0];
      form.setFieldsValue(data);
      initialValuesRef.current = data;
    }
  }, [defaultValue]);

  return (
    <Form
      form={form}
      name="inventoryControl"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col lg:grid lg:grid-cols-2 gap-2 p-4`}
    >
      <Form.Item
        label="لید تایم"
        name="LeadTime"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "number" },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <CustomInputNumber controls={false} min={1} />
      </Form.Item>
      <Form.Item
        label="نقطه سفارش"
        name="OrderPoint"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "number" },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <CustomInputNumber controls={false} min={1} />
      </Form.Item>
      <Form.Item
        label="میزان سفارش"
        name="OrderAmount"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "number" },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <CustomInputNumber controls={false} />
      </Form.Item>
      <Form.Item
        label="واحد اندازه گیری"
        name="MeasureUnitId"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "number" },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={measureUnitConfig}
          config={{
            name: "MeasureUnitId",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="نوع موجودی"
        name="InventoryTypeId"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "number" },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={inventoryTypeConfig}
          config={{
            name: "InventoryTypeId",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>

      <Form.Item className="col-span-2 m-0 p-0 text-xs">
        <div className="flex justify-end items-center gap-2 pt-2">
          <CustomButton
            type="text"
            htmlType="submit"
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
