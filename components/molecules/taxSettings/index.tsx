import {
  useEffect,
  useRef,
} from 'react';

import {
  Checkbox,
  Form,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import CustomInputNumber from '@components/atoms/defaultElements/inputNumber';
import InputText from '@components/atoms/defaultElements/inputText';
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

export const TaxSettings = ({ handleClose, sourceKey, id }) => {
  const { data: defaultValue } = useGetData<IGood[], IRequest>({
    url: "api/com/select/goods",
    body: {
      RepoViewId: 30092,
      Id: id,
    },
    skip: !id,
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();
  const t = useTranslations();
  const [form] = Form.useForm();

  const initialValuesRef = useRef<any>(null);

  const handleSubmit = async (values) => {
    try {
      if (!id) return;

      const changedFields: string[] = [];

      Object.keys(values).forEach((key) => {
        if (values[key] !== initialValuesRef.current?.[key]) {
          changedFields.push(key);
        }
      });

      if (changedFields.length > 0) {
        const mutateResult = await mutateItem({
          url: "/api/com/update/goods/goodsAdjustments",
          body: {
            ...values,
            [sourceKey]: id,
            RepoViewId: 30092,
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
    if (defaultValue?.Data?.[0]) {
      const data = defaultValue.Data[0];
      form.setFieldsValue(data);
      initialValuesRef.current = data;
    }
  }, [defaultValue]);

  const legalFunds = Form.useWatch("LegalFunds", form);
  const taxFunds = Form.useWatch("TaxFunds", form);

  return (
    <Form
      form={form}
      name="taxSettings"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col lg:grid lg:grid-cols-4  gap-2 p-4`}
    >
      <Form.Item
        label="کد مودیان"
        name="MoadianCode"
        rules={[{ required: true, message: "این فیلد الزامی است." }]}
        className="flex flex-col col-span-2 !mb-0 !pb-0 text-xs"
      >
        <InputText />
      </Form.Item>

      <Form.Item
        name="LegalFunds"
        valuePropName="checked"
        initialValue={false}
        className={`${
          !legalFunds ? "col-span-2" : ""
        } flex flex-col justify-end !mb-0 !pb-0 text-xs`}
      >
        <Checkbox>سایر وجوه قانونی</Checkbox>
      </Form.Item>

      {legalFunds && (
        <Form.Item
          label="نرخ وجوه قانونی"
          name="LegalFundsRate"
          rules={[
            {
              required: legalFunds,
              message: "این فیلد الزامی است.",
            },
          ]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <CustomInputNumber min={0} controls={false} />
        </Form.Item>
      )}

      <Form.Item
        name="TaxFunds"
        valuePropName="checked"
        initialValue={false}
        className={`${
          !taxFunds ? "col-span-2" : ""
        } flex flex-col justify-end !mb-0 !pb-0 text-xs`}
      >
        <Checkbox>سایر مالیات‌ها</Checkbox>
      </Form.Item>

      {taxFunds && (
        <Form.Item
          label="نرخ سایر مالیات‌ها"
          name="TaxFundsRate"
          rules={[
            {
              required: taxFunds,
              message: "این فیلد الزامی است.",
            },
          ]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <CustomInputNumber min={0} controls={false} />
        </Form.Item>
      )}

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
