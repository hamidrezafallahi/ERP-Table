import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Checkbox,
  Divider,
  Form,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  CustomSelect,
} from '@components/atoms/defaultElements';
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

import ModalForGoodQc from './ModalForGoodQc';

export const GoodSettings = ({ handleClose, sourceKey, id }) => {
  const { data: defaultValue } = useGetData<IGood[], IRequest>({
    url: "api/com/select/goods",
    body: {
      RepoViewId: 30093,
      Id: id,
    },
    skip: !id,
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();
  const t = useTranslations();
  const [form] = Form.useForm();

  const automaticallyBatchValue = Form.useWatch("IsAutomaticallyBatch", form);
  const batchNoValue = Form.useWatch("IsHasBatchNo", form);
  const isService = Form.useWatch("IsService", form);

  const hasInputQualityValue = Form.useWatch("HasInputQuality", form);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prevHasInputQualityRef = useRef<boolean | undefined>(undefined);

  const initialValuesRef = useRef<any>(null);

  const StockExistPolicyOptions = [
    { value: 1, label: "FIFO" },
    { value: 2, label: "LIFO" },
    { value: 3, label: "FEFO" },
    { value: 4, label: "LEFO" },
    { value: 5, label: "FEMO" },
    { value: 6, label: "Batch-wis" },
  ];

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
          url: "/api/com/update/goods/goodsSettings",
          body: {
            ...values,
            [sourceKey]: id,
            RepoViewId: 30093,
            ChangeFields: changedFields,
          },
        }).unwrap();

        if (mutateResult?.Result === "Pending") {
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
      prevHasInputQualityRef.current = data?.HasInputQuality;
    }
  }, [defaultValue]);

  useEffect(() => {
    const prevValue = prevHasInputQualityRef.current;
    if (prevValue === true && hasInputQualityValue === false) {
      setIsModalOpen(true);
    }
    prevHasInputQualityRef.current = hasInputQualityValue;
  }, [hasInputQualityValue]);

  return (
    <>
      <Form
        form={form}
        name="goodSettings"
        layout="vertical"
        onFinish={handleSubmit}
        className={`flex flex-col justify-between h-[calc(100dvh - 5rem)] lg:h-full p-4`}
      >
        <div
          className={`flex flex-col lg:grid lg:grid-cols-2 gap-2 overflow-y-scroll lg:overflow-y-hidden h-[calc(100dvh-9.75rem)] lg:h-full mb-4 lg:!mb-0`}
        >
          {!isService && (
            <Form.Item
              name="IsRawMaterials"
              valuePropName="checked"
              initialValue={false}
              className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
            >
              <Checkbox>مواد اولیه</Checkbox>
            </Form.Item>
          )}
          <Form.Item
            name="IsProduct"
            valuePropName="checked"
            initialValue={false}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          >
            <Checkbox>محصول</Checkbox>
          </Form.Item>
          {!isService && (
            <Form.Item
              name="IsSemiFinishedProduct"
              valuePropName="checked"
              initialValue={false}
              className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
            >
              <Checkbox>محصول نیمه‌ساخته</Checkbox>
            </Form.Item>
          )}
          {!isService && (
            <Form.Item
              name="IsTools"
              valuePropName="checked"
              initialValue={false}
              className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
            >
              <Checkbox>ابزار</Checkbox>
            </Form.Item>
          )}
          {!isService && (
            <Form.Item
              name="IsConsumable"
              valuePropName="checked"
              initialValue={false}
              className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
            >
              <Checkbox>بسته بندی مصرفی</Checkbox>
            </Form.Item>
          )}
          {!isService && (
            <Form.Item
              name="IsReversible"
              valuePropName="checked"
              initialValue={false}
              className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
            >
              <Checkbox>بسته بندی برگشت پذیر</Checkbox>
            </Form.Item>
          )}
          <Divider className="col-span-2 my-0" />
          <Form.Item
            name="IsSaleable"
            valuePropName="checked"
            initialValue={false}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          >
            <Checkbox>قابلیت فروش</Checkbox>
          </Form.Item>
          <Divider className="col-span-2 my-0" />
          {!isService && (
            <Form.Item
              name="IsHasExpireDate"
              valuePropName="checked"
              initialValue={false}
              className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
            >
              <Checkbox>دارای تاریخ انقضا</Checkbox>
            </Form.Item>
          )}
          <Form.Item
            name="HasInputQuality"
            valuePropName="checked"
            initialValue={false}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          >
            <Checkbox>کنترل کیفیت ورودی</Checkbox>
          </Form.Item>
          {!isService && (
            <Form.Item
              name="IsLocationable"
              valuePropName="checked"
              initialValue={false}
              className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
            >
              <Checkbox>مکان پذیر</Checkbox>
            </Form.Item>
          )}
          {!isService && (
            <Form.Item
              name="HasMultipleOwner"
              valuePropName="checked"
              initialValue={false}
              className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
            >
              <Checkbox>چند مالکیتی</Checkbox>
            </Form.Item>
          )}
          {!isService && (
            <Form.Item
              name="IsAllowInventoryNegative"
              valuePropName="checked"
              initialValue={false}
              className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
            >
              <Checkbox>جلوگیری از موجودی منفی</Checkbox>
            </Form.Item>
          )}
          {!isService && (
            <>
              <Divider className="col-span-2 my-0" />
              <Form.Item
                name="IsSerilizeable"
                valuePropName="checked"
                initialValue={false}
                className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
              >
                <Checkbox>سریال پذیر</Checkbox>
              </Form.Item>
              <Form.Item
                name="IsHasBatchNo"
                valuePropName="checked"
                initialValue={false}
                className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
              >
                <Checkbox>بچ پذیر</Checkbox>
              </Form.Item>
              {batchNoValue && (
                <>
                  <Form.Item
                    name="IsAutomaticallyBatch"
                    valuePropName="checked"
                    initialValue={false}
                    className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
                  >
                    <Checkbox> بچ اتوماتیک</Checkbox>
                  </Form.Item>
                  {automaticallyBatchValue && (
                    <Form.Item
                      label="الگوی بچ گذاری"
                      name="AutomaticallyBatchPattern"
                      className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
                    >
                      <InputText />
                    </Form.Item>
                  )}
                </>
              )}
            </>
          )}
          <Divider className="col-span-2 my-0" />
          <div className="flex lg:flex-row flex-col gap-2 lg:col-span-2 lg:mb-2 w-full">
            {!isService && (
              <Form.Item
                label="سیاست خروج از انبار"
                name="StockExistsPolicy"
                className="lg:flex-1 lg:col-span-1 !mb-0 !pb-0 text-xs"
              >
                <CustomSelect options={StockExistPolicyOptions} />
              </Form.Item>
            )}
            <Form.Item
              label="ماکزیمم تخفیف مجاز"
              name="ItemCap"
              className="lg:flex-1 lg:col-span-1 !mb-0 !pb-0 text-xs"
            >
              <CustomInputNumber controls={false} max={100} min={1} />
            </Form.Item>
          </div>
        </div>
        <Form.Item className="col-span-2 m-0 text-xs">
          <div className="flex justify-end items-center gap-2">
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
      <ModalForGoodQc
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        form={form}
      />
    </>
  );
};
