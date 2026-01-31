import { useRef } from "react";

import { Form, Spin } from "antd";
import { useTranslations } from "next-intl";

import {
  CustomButton,
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";
import { SpinIcon } from "@components/atoms/iconComponents";
import { useCUDDataMutation } from "@services/base";
import type { IRequestConfig } from "@type/elementType";
import { showSuccessToast } from "@utils/core";

export const PurchaseRequest = ({ handleClose, ids }) => {
  // Parse incoming ids (pattern: [goodId-quantity-measureUnitId])
  const details = Array.isArray(ids)
    ? ids
        .map((id, idx) => {
          const parts = String(id).split("-");
          if (parts.length !== 3) return null;
          const [g, q, m] = parts;
          return {
            GoodId: Number(g),
            Qty: Number(q),
            MeasureUnitId: Number(m),
            RowNum: idx + 1,
          };
        })
        .filter((d) => d !== null)
    : [];

  // const { data: defaultValue } = useGetData<IGood[], IRequest>({
  //   url: "api/com/select/goods",
  //   body: {
  //     RepoViewId: 30023,
  //     // [sourceKey]: id,
  //     Id: id,
  //   },
  //   skip: !id,
  // });

  const patternConfig: IRequestConfig = {
    addWebUrl: null,
    endpoint: null,
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
      if (ids) {
        const mutateResult = await mutateItem({
          url: "api/buy/insert/buyRequest",
          body: {
            ...values,
            Details: details,
            IsMasterDetail: false,
            // ChangeFields: changedFields,
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

  // useEffect(() => {
  //   if (defaultValue) {
  //     const data = defaultValue?.Data?.[0];
  //     form.setFieldsValue(data);
  //     initialValuesRef.current = data;
  //   }
  // }, [defaultValue]);

  return (
    <Form
      form={form}
      name="inventoryControl"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col lg:grid lg:grid-cols-2 gap-2 p-4`}
    >
      <Form.Item
        label="تاریخ"
        name="VoucherDate"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "string" },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <NewDatePicker />
      </Form.Item>
      <Form.Item
        label="الگوی شماره گذاری"
        name="VoucherTypeId"
        // rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={patternConfig}
          showSearch
          allowClear
          onClear={() => form.setFieldValue("VoucherTypeId", null)}
          infinite
        />
      </Form.Item>
      <Form.Item
        label="شرح"
        name="VoucherDesc"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "string" },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <InputText />
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
