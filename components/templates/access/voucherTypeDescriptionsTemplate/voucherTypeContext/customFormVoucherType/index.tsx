import React from "react";
import { Form, Spin } from "antd";
import { useTranslations } from "next-intl";
import { CustomButton, CustomTooltip } from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";
import { PlusOutline, SpinIcon } from "@components/atoms/iconComponents";
import { useCUDDataMutation, useGetData } from "@services/base";

export default function CustomFormVoucherType({ voucherTypeId, form }) {
  const t = useTranslations();
  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const { refetch: ReLoad } = useGetData({
    url: `/api/acc/select/voucherTypeDescriptions`,
    body: {
      RepoId: 0,
    },

    skip: true,
  });

  const handleSubmit = async (values: any) => {
    const res = await mutateItem({
      url: `/api/acc/insert/voucherTypeDescriptions`,
      body: {
        Desc: values.Desc,
        voucherTypeId,
      },
    }).unwrap();

    if (res?.Result == "Success") {
      form.resetFields();
      ReLoad;
    }
  };

  return (
    <>
      <Form
        form={form}
        name="validateOnly"
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="شرح"
          name="Desc"
          className="flex flex-col w-full text-xs"
          rules={[{ required: true, message: t("form.required") }]}
        >
          <InputText />
        </Form.Item>
        <Form.Item className="col-span-12 lg:col-span-3 m-0 p-0 text-xs">
          <div className="flex justify-end items-center gap-2 pt-1 w-full">
            <CustomTooltip title={t("general.addNew")}>
              <span
                className="px-2 py-[2.8px] bg-gray-gray3 rounded cursor-pointer"
                onClick={() => {
                  form.resetFields();
                }}
              >
                <PlusOutline />
              </span>
            </CustomTooltip>
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
    </>
  );
}
