import { Form } from 'antd';

import { NewDatePicker } from '@components/atoms/defaultElements';
import DynamicRadio from '@components/molecules/dynamicRadioList';
import { VoucherSortTypeEnum } from '@services/acc/voucher/type';

export const SortingVoucher = ({ form, setMobileDrawerContent }) => {
    return (
        <Form form={form} className="gap-4 grid grid-cols-3">
            <Form.Item
                label="از تاریخ"
                name="From"
                rules={[
                    { required: true, message: "این فیلد الزامی است.", type: "string" },
                ]}
                className="flex flex-col !mb-0 !pb-0 text-xs"
            >
                <NewDatePicker
                    config={{
                        name: "From",
                        caption: "از تاریخ",
                        type: "date",
                        setFieldValue: form.setFieldValue,
                    }}
                />
            </Form.Item>
            <Form.Item
                label="تا تاریخ"
                name="To"
                rules={[
                    { required: true, message: "این فیلد الزامی است.", type: "string" },
                ]}
                className="flex flex-col !mb-0 !pb-0 text-xs"
            >
                <NewDatePicker
                    config={{
                        name: "To",
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
