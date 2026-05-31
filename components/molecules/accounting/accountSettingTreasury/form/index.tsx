import {
  useEffect,
  useState,
} from 'react';

import {
  Form,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  CustomTooltip,
  DynamicSelect,
} from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import {
  PlusOutline,
  SpinIcon,
} from '@components/atoms/iconComponents';
import type {
  IAccountSetting,
  IRequest,
} from '@services/acc/accountSetting/type';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import type { IRequestConfig } from '@type/elementType';
import { transformDotNotationToNested } from '@utils/core';
import { showSuccessToast } from '@utils/toast';

import type { IProps } from './type';

export const AccountSettingForm = ({
  id,
  clearId,
  selectedSubtotal,
}: IProps) => {
  const t = useTranslations();
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);

  const { data: defaultValue } = useGetData<IAccountSetting[], IRequest>({
    url: "/api/trh/select/rpWay",
    body: {
      Id: id,
    },
    skip: !id,
  });
  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const [accountId, setAccountId] = useState<number[]>(selectedSubtotal);
  const [changeFields, setChangeFields] = useState([]);
  const [originalValues, setOriginalValues] = useState(null);

  const formIsValid = formValues
    ? Object.values(formValues).every((value) => value !== undefined)
    : false;

  const handleSubmit = async (values) => {
    const cleanValues = transformDotNotationToNested(values);

    try {
      let mutateResult;

      if (id) {
        mutateResult = await mutateItem({
          url: "/api/trh/update/rpWay",
          body: {
            ...cleanValues,
            ChangeFields: changeFields,
            RpWayId: id,
          },
        }).unwrap();
      } else {
        if (accountId.length > 1) {
          mutateResult = await mutateItem({
            url: "/api/trh/insert/multi/rpWay",
            body: {
              VoucherTypeId: cleanValues.VoucherTypeId,
              AccountIds: accountId,
            },
          }).unwrap();
        } else {
          mutateResult = await mutateItem({
            url: "/api/trh/insert/rpWay",
            body: {
              ...cleanValues,
              AccountId: selectedSubtotal[0],
            },
          }).unwrap();
        }
      }
      if (mutateResult?.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        form.resetFields();
        setAccountId(selectedSubtotal);
        clearId();
      }
    } catch (error) {
      null;
    }
  };

  const voucherTypeConfig: IRequestConfig = {
    addWebUrl: "/api/trh/select/voucherType4searchBox",
    endpoint: "/api/trh/select/voucherType4searchBox",
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
      setAccountId([defaultValue?.Data[0]?.AccountId]);
    }
  }, [defaultValue?.Data, form, id]);

  useEffect(() => {
    form.resetFields();
    setChangeFields([]);
    setOriginalValues(null);
    setAccountId(selectedSubtotal);
  }, [selectedSubtotal]);

  return (
    <Form
      form={form}
      name="accountSetting"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col lg:grid lg:grid-cols-3 gap-2`}
    >
      <Form.Item
        label="نوع سند"
        name="VoucherTypeId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={voucherTypeConfig}
          showSearch
          allowClear
          onClear={() => form.setFieldValue("VoucherTypeId", null)}
          infinite
        />
      </Form.Item>
      <Form.Item
        label="کد نحوه"
        name="RPWayCode"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <InputText disabled={accountId?.length > 1} />
      </Form.Item>
      <Form.Item
        label="شرح نحوه"
        name="RPWayDesc"
        rules={[]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <InputText disabled={accountId?.length > 1} />
      </Form.Item>

      <Form.Item className="justify-items-end col-span-3 m-0 p-0 text-xs">
        <div className="flex justify-end items-center gap-2 pt-2">
          <CustomTooltip title={t("general.addNew")}>
            <span
              className="bg-gray-gray3 px-2 py-[2.8px] rounded cursor-pointer"
              onClick={() => {
                clearId();
                form.resetFields();
                setAccountId(selectedSubtotal);
              }}
            >
              <PlusOutline />
            </span>
          </CustomTooltip>

          <CustomButton
            type="text"
            htmlType="submit"
            disabled={
              id
                ? changeFields.length === 0
                : selectedSubtotal.length > 1
                ? false
                : !formIsValid
            }
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
