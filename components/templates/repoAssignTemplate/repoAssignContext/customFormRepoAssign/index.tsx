import { useEffect } from "react";

import { CustomButton } from "@components/atoms/defaultElements";
import { SpinIcon } from "@components/atoms/iconComponents";
import { useAppSelector } from "@redux/index";
import { useCUDDataMutation, useGetData } from "@services/base";
import { Checkbox, Form, Spin } from "antd";
import { useTranslations } from "next-intl";

export default function CustomFormRepoAssign({
  selectedGoodId,
  systemId,
  form,
}) {
  const t = useTranslations();
  const placeId = useAppSelector(
    (state) => state.withPersist.config.defaultConfigs.PlaceId.id,
  );

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const { data, refetch } = useGetData<{ IsAssign: boolean; Id: number }, null>(
    {
      url: "/api/serverSide/select/repoAssign",
      body: {
        RepoId: selectedGoodId,
        SystemId: systemId,
        PlaceId: placeId,
      },
      skip: !selectedGoodId || !systemId,
    },
  );

  useEffect(() => {
    if (selectedGoodId && systemId) {
      refetch();
    }
  }, [systemId, selectedGoodId, refetch]);

  useEffect(() => {
    if (data?.Data) {
      form.setFieldsValue({
        IsAssignable: data.Data?.IsAssign,
      });
    }
  }, [data?.Data]);

  const insertBody = {
    RepoId: selectedGoodId,
    SystemId: systemId,
    PlaceId: placeId,
  };
  const deleteBody = {
    RepoId: selectedGoodId,
    SystemId: systemId,
    Id: data?.Data?.Id,
  };

  const handleSubmit = async (values: any) => {
    const url = values.IsAssignable
      ? "/api/serverSide/insert/repoAssign"
      : "/api/serverSide/delete/repoAssign";
    const res = await mutateItem({
      url,
      body: values.IsAssignable ? insertBody : deleteBody,
    }).unwrap();

    if (res?.Result == "Success") {
      form.resetFields();
      refetch();
      form.setFieldsValue({
        IsAssignable: data.Data.IsAssign,
      });
    }
  };

  return (
    <>
      <Form
        form={form}
        name="validateOnly"
        layout="vertical"
        onFinish={handleSubmit}
        className="gap-x-4 lg:gap-y-3 grid grid-cols-3"
      >
        <Form.Item
          name="IsAssignable"
          valuePropName="checked"
          initialValue={false}
          className="flex flex-col justify-end !mb-0 !pb-0 text-xs"
        >
          <Checkbox> {t("general.assignability")}</Checkbox>
        </Form.Item>
        <Form.Item className="col-span-12 lg:col-span-3 m-0 p-0 text-xs">
          <div className="flex justify-end items-center gap-2 pt-1 w-full">
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
