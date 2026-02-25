"use client";

import { InvoiceForm } from "@components/molecules/salesAndPurchase/invoiceForm";
import { Form } from "antd";
import type { IProps } from "./type";

export default function InvoiceTemplate<T, K>({ ...props }: IProps) {
  const { caption, listUrl, pageIcon } = props;

  const [form] = Form.useForm();

  return (
    <div className="relative flex flex-col gap-5">
      {/* <button
        className="-top-14 absolute flex bg-black-black95 hover:bg-white px-3 py-[6px] border hover:border-black-black95 rounded text-white hover:text-black-black95 cursor-pointer -end-3 item-center"
        onClick={handleSubmit}
      >
        {t("general.submit")}
      </button> */}
      <InvoiceForm form={form} />
    </div>
  );
}
