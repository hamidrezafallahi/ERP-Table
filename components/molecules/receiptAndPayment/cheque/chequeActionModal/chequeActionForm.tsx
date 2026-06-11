import { CustomButton } from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";
import { SpinIcon } from "@components/atoms/iconComponents";
import { useCUDDataMutation } from "@services/base";
import { Form, Spin } from "antd";
import { useTranslations } from "next-intl";
import React, {
  ClipboardEvent,
  Dispatch,
  KeyboardEvent,
  SetStateAction,
} from "react";
import { ChequeState } from "./enum";
import { showSuccessToast } from "@utils/toast";

interface ChequeActionFormProps {
  setSelectedDetails?: Dispatch<SetStateAction<[]>>;
  setSelectedItems?: Dispatch<SetStateAction<number[]>>;
  selectedDetails?: any[];
}

const ChequeActionForm = (props: ChequeActionFormProps) => {
  const { setSelectedDetails, setSelectedItems, selectedDetails } = props;
  const t = useTranslations();
  const [form] = Form.useForm();
  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const ChequeStateFromLabel: Record<string, ChequeState> = {
    "نزد بانک": ChequeState.AtTheBank,
    "نزد صندوق": ChequeState.AtTheCash,
    "وصول شده": ChequeState.Passed,
    "نزد شخص": ChequeState.AtThePerson,
    "نزد تنخواه": ChequeState.AtTheCashFund,
    برگشتی: ChequeState.Reversal,
  };

  const handleSubmit = async (values) => {
    const stateLabel = selectedDetails[0]["DocumentCheque.StateId"];
    console.log({ stateLabel });

    const stateId = ChequeStateFromLabel[stateLabel];
    console.log({ stateId });
    const res = await mutateItem({
      url: "/api/trh/select/documentCheque/sayad",
      body: {
        SayadNum: values.SayadNum,
        StateId: stateId,
      },
    }).unwrap();
    if (res?.Result == "Success") {
      console.log({ res });
      showSuccessToast(t("toast.successTitle"));
      form.resetFields();
    }
  };

  const onlyNumbers = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!/[0-9]/.test(e.key)) e.preventDefault();
  };

  const onlyNumbersPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text");
    if (!/^\d*$/.test(paste)) e.preventDefault();
  };
  const inputProps = {
    onKeyPress: onlyNumbers,
    onPaste: onlyNumbersPaste,
  };
  return (
    <Form
      form={form}
      onFinish={handleSubmit}
      layout="vertical"
      className="flex justify-between items-end"
    >
      <Form.Item
        label={t("general.sayyadNumber")}
        name="SayadNum"
        className="flex flex-col !mb-0 !pb-0 w-1/2 text-xs"
        rules={[
          {
            pattern: /^\d{16}$/,
            message: "شماره صیادی باید دقیقاً ۱۶ رقم باشد",
          },
          { required: true, message: t("form.required") },
        ]}
      >
        <InputText maxLength={16} {...inputProps} />
      </Form.Item>
      <Form.Item className="m-0 p-0 text-xs">
        <CustomButton
          type="text"
          htmlType="submit"
          className="bg-black-black8 hover:bg-white px-8 border hover:border-black-black8 rounded text-white disabled:text-gray-gray6 text-xs"
        >
          {mutateIsLoading ? (
            <Spin size="large" indicator={<SpinIcon />} />
          ) : (
            t("general.add")
          )}
        </CustomButton>
      </Form.Item>
    </Form>
  );
};

export default ChequeActionForm;
