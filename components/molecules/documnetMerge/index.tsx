import { CustomButton, NewDatePicker } from "@components/atoms/defaultElements";
import { SpinIcon } from "@components/atoms/iconComponents";
import { useCUDDataMutation } from "@services/base";
import { Form, Input, Spin } from "antd";
import { useTranslations } from "next-intl";
import { Dispatch, SetStateAction, useState } from "react";
import InputText from "@components/atoms/defaultElements/inputText";
import { DateValue } from "react-persian-range-picker";
import { showSuccessToast } from "@utils/core";
import { ActiveModal } from "@components/organisms/listToolbar/type";
import { useDocumentMerge } from "./hooks";

interface DocumentMergeProps {
  refIds: number[];
  setActiveModal: Dispatch<SetStateAction<ActiveModal>>;
  activeModal: ActiveModal;
}

export const DocumentMerge = (props: DocumentMergeProps) => {
  const { refIds, activeModal, setActiveModal } = props;
  const [form] = Form.useForm();
  const t = useTranslations();
  const [voucherDate, setVoucherDate] = useState<DateValue>(null);
  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const {
    handleRadioClick,
    radioOptions,
    defaultVoucherDate,
    vouchersCount,
    voucherTypeDesc,
    selected,
    allSameVoucherDate,
    selectedRadio,
  } = useDocumentMerge({ refIds, form });

  const handleSubmit = async (values: any) => {
    const payload = {
      Ids: refIds,
      VoucherDatee: allSameVoucherDate ? defaultVoucherDate : voucherDate,
      VoucherTypeId: selected?.[0]?.VoucherTypeId ?? null,
      VoucherDesc: values.VoucherDesc ?? null,
      MergeType: values.MergeType,
    };

    const res = await mutateItem({
      url: "/api/acc/insert/mergeVouchers",
      body: payload,
    }).unwrap();
    if (res?.Result == "Success") {
      showSuccessToast(t("toast.successTitle"));
      form.resetFields();
      if (activeModal === "documentMerge") {
        setActiveModal(null);
      }
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      className="flex flex-col w-full gap-6 p-2"
    >
      <Form.Item
        name="MergeType"
        className="flex flex-col w-full lg:col-span-12 !mb-0 !pb-0 text-xs"
      >
        <div className="flex justify-between items-center w-full">
          {radioOptions.map((item) => (
            <button
              key={item.value}
              type="button"
              disabled={item.disabled}
              onClick={() => handleRadioClick(item.value)}
              className={`w-36 h-14 rounded-lg border text-sm transition-all duration-200
    ${
      item.disabled
        ? "cursor-not-allowed bg-gray-gray5 text-gray-gray8 border-gray-gray5"
        : selectedRadio === item.value
          ? "bg-black-black8 text-white border-black-black8 shadow-inner"
          : "bg-white text-gray-gray8 border-gray-gray3 hover:bg-gray-gray1"
    }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Form.Item>
      <div className="flex flex-col gap-3">
        <Form.Item
          label={""}
          name="VDate"
          className="flex gap-2 items-center !mb-0 !pb-0 text-xs w-1/2"
        >
          <div className="flex gap-2 items-center">
            <span className="items-center font-normal text-gray-gray10 text-xs inline-flex flex-none w-auto">
              {t("general.voucherDate")}:
            </span>
            {!allSameVoucherDate ? (
              <NewDatePicker
                config={{
                  caption: t("general.voucherDate"),
                  name: "VoucherDate",
                  type: "date",
                  setFieldValue: form.setFieldValue,
                }}
                onChange={(date) => setVoucherDate(date)}
              />
            ) : (
              <Input
                value={defaultVoucherDate}
                name="VoucherDate"
                readOnly
                className="border-0 hover:border-0 focus:!border-0"
              />
            )}
          </div>
        </Form.Item>
        {voucherTypeDesc && (
          <Form.Item
            label={""}
            name="VoucherDesc"
            className="flex gap-2 items-center !mb-0 !pb-0 text-xs w-1/2"
          >
            <div className="flex gap-2 items-center">
              <span className="items-center font-normal text-gray-gray10 text-xs inline-flex flex-none w-auto">
                {t("general.voucherType")}:
              </span>
              <div className="h-[38px] flex items-center px-3">
                {voucherTypeDesc}
              </div>
              <Form.Item name="VoucherType" hidden>
                <Input />
              </Form.Item>
            </div>
          </Form.Item>
        )}
        <Form.Item
          label={""}
          name="VouchersCount"
          className="flex gap-2 items-center !mb-0 !pb-0 text-xs w-1/2"
        >
          <div className="flex gap-2 items-center">
            <span className="items-center font-normal text-gray-gray10 text-xs inline-flex flex-none w-auto">
              {t("general.vouchersCount")}:
            </span>
            <div className="h-[38px] flex items-center px-3">
              {vouchersCount}
            </div>
            <Form.Item name="VouchersCount" hidden>
              <Input />
            </Form.Item>
          </div>
        </Form.Item>
        <Form.Item
          label=""
          name="VoucherDesc"
          className="flex gap-2 items-center !mb-0 !pb-0 text-xs w-full documentsMerge"
        >
          <div className="flex gap-2 items-center w-full">
            <span className="items-center font-normal text-gray-gray10 text-xs inline-flex flex-none w-auto">
              {t("general.caption")}:
            </span>
            <InputText className="w-full" />
          </div>
        </Form.Item>
      </div>
      <div className="w-full flex justify-end">
        <CustomButton
          type="text"
          htmlType="submit"
          className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
        >
          {mutateIsLoading ? (
            <Spin size="large" indicator={<SpinIcon />} />
          ) : (
            t("general.accept")
          )}
        </CustomButton>
      </div>
    </Form>
  );
};
