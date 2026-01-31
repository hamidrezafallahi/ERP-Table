import { Form } from "antd";

import { NewDatePicker } from "@components/atoms/defaultElements";
import DynamicRadio from "@components/molecules/dynamicRadioList";
import { VoucherSortTypeEnum } from "@services/acc/voucher/type";

export const SortingVoucher = ({ form, setMobileDrawerContent }) => {
  return (
    <Form form={form} className="gap-4 grid grid-cols-3">
      <Form.Item
        label="تا تاریخ"
        name="Date"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "string" },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <NewDatePicker
          config={{
            name: "Date",
            caption: "تا تاریخ",
            type: "date",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        // label="نوع"
        name="SortType"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "number" },
        ]}
        className="flex flex-col col-span-3 !mb-0 !pb-0 text-xs"
      >
        {/* <Radio.Group
          value={VoucherSortTypeEnum.ByVoucherDate}
          className="flex flex-col gap-2"
        >
          <Radio value={VoucherSortTypeEnum.ByCreateTime}>زمان ثبت سند</Radio>
          <Radio value={VoucherSortTypeEnum.ByVoucherDate}>تاریخ سند</Radio>
          <Radio value={VoucherSortTypeEnum.ByDateThenCreateTime}>
            تاریخ سند / ساعت ثبت سند
          </Radio>
        </Radio.Group> */}
        <DynamicRadio
          config={{
            name: "SortType",
            caption: "نوع",
            type: "radio",
            setFieldValue: form.setFieldValue,
          }}
          item={{
            radioValues: [
              {
                caption: "زمان ثبت سند",
                value: VoucherSortTypeEnum.ByCreateTime,
              },
              {
                caption: "تاریخ سند",
                value: VoucherSortTypeEnum.ByVoucherDate,
              },
              {
                caption: "تاریخ سند / ساعت ثبت سند",
                value: VoucherSortTypeEnum.ByDateThenCreateTime,
              },
            ],
          }}
        />
      </Form.Item>
    </Form>
  );
};
