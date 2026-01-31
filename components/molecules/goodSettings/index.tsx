import { useEffect, useRef, useState } from "react";

import { Checkbox, Divider, Form, Spin } from "antd";
import { useTranslations } from "next-intl";

import { CustomButton, CustomSelect } from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";
import { SpinIcon } from "@components/atoms/iconComponents";
import { useCUDDataMutation, useGetData } from "@services/base";
import type { IGood, IRequest } from "@services/com/good/type";
import { showSuccessToast } from "@utils/core";

import ModalForGoodQc from "./ModalForGoodQc";

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
        className={`flex flex-col justify-between h-full p-4`}
      >
        <div
          className={`flex flex-col lg:grid lg:grid-cols-2 h-fit gap-2 px-4`}
        >
          <Form.Item
            name="IsRawMaterials"
            valuePropName="checked"
            initialValue={false}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          >
            <Checkbox>مواد اولیه</Checkbox>
          </Form.Item>
          <Form.Item
            name="IsProduct"
            valuePropName="checked"
            initialValue={false}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          >
            <Checkbox>محصول</Checkbox>
          </Form.Item>
          <Form.Item
            name="IsSemiFinishedProduct"
            valuePropName="checked"
            initialValue={false}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          >
            <Checkbox>محصول نیمه‌ساخته</Checkbox>
          </Form.Item>
          <Form.Item
            name="IsTools"
            valuePropName="checked"
            initialValue={false}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          >
            <Checkbox>ابزار</Checkbox>
          </Form.Item>
          <Form.Item
            name="IsConsumable"
            valuePropName="checked"
            initialValue={false}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          >
            <Checkbox>بسته بندی مصرفی</Checkbox>
          </Form.Item>
          <Form.Item
            name="IsReversible"
            valuePropName="checked"
            initialValue={false}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          >
            <Checkbox>بسته بندی برگشت پذیر</Checkbox>
          </Form.Item>
          <Divider className="col-span-2 my-[2px]" />
          <Form.Item
            name="IsSaleable"
            valuePropName="checked"
            initialValue={false}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          >
            <Checkbox>قابلیت فروش</Checkbox>
          </Form.Item>
          <Divider className="col-span-2 my-[2px]" />
          <Form.Item
            name="IsHasExpireDate"
            valuePropName="checked"
            initialValue={false}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          >
            <Checkbox>دارای تاریخ انقضا</Checkbox>
          </Form.Item>
          <Form.Item
            name="HasInputQuality"
            valuePropName="checked"
            initialValue={false}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          >
            <Checkbox>کنترل کیفیت ورودی</Checkbox>
          </Form.Item>
          <Form.Item
            name="IsLocationable"
            valuePropName="checked"
            initialValue={false}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          >
            <Checkbox>امکان پذیر</Checkbox>
          </Form.Item>
          <Form.Item
            name="HasMultipleOwner"
            valuePropName="checked"
            initialValue={false}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          >
            <Checkbox>چند مالکیتی</Checkbox>
          </Form.Item>
          <Form.Item
            name="IsAllowInventoryNegative"
            valuePropName="checked"
            initialValue={false}
            className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
          >
            <Checkbox>جلوگیری از موجودی منفی</Checkbox>
          </Form.Item>
          <Divider className="col-span-2 my-[2px]" />
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
          <Divider className="col-span-2 my-[2px]" />
          <div className="grid grid-cols-2 col-span-2">
            <Form.Item
              label="سیاست خروج از انبار"
              name="StockExistsPolicy"
              className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
            >
              <CustomSelect options={StockExistPolicyOptions} />
            </Form.Item>
          </div>
        </div>
        <Form.Item className="col-span-2 m-0 py-2 text-xs">
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
      <ModalForGoodQc
        setIsModalOpen={setIsModalOpen}
        isModalOpen={isModalOpen}
        form={form}
      />
    </>
  );
};
