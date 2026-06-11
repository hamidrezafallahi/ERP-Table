import {
  CustomButton,
  CustomTooltip,
  DynamicSelect,
} from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";
import { PlusOutline, SpinIcon } from "@components/atoms/iconComponents";
import {
  IDynamicModalConfig,
  RecordType,
} from "@components/organisms/sideBarForm/types";
import { useAppSelector } from "@hooks/custom/useAppSelector";
import { useFormChangeFields } from "@hooks/custom/useFormChangeFields";
import { useCUDDataMutation } from "@services/base";
import { ReloadType } from "@services/types";
import { showSuccessToast } from "@utils/toast";
import { Form, FormInstance, Spin } from "antd";
import { useTranslations } from "next-intl";
import React, { Dispatch, SetStateAction, useEffect } from "react";

interface RpWayFormContextProps {
  form: FormInstance<any>;
  typeId: number;
  config: IDynamicModalConfig;
  editingRecord: RecordType;
  setEditingRecord: Dispatch<SetStateAction<RecordType>>;
  refetchCard: ReloadType;
  refetchTable: ReloadType;
}

const RpWayFormContext = (props: RpWayFormContextProps) => {
  const {
    form,
    config,
    typeId,
    editingRecord,
    setEditingRecord,
    refetchCard,
    refetchTable,
  } = props;
  const t = useTranslations();
  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();
  const formValues = Form.useWatch([], form);
  const isEdit = !!editingRecord;
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  });

  const { setInitialValues, reset, changeFields } = useFormChangeFields(
    form,
    formValues,
    ["AccountId"],
  );

  useEffect(() => {
    if (editingRecord) {
      setInitialValues({ Desc: editingRecord.Desc });
    } else {
      reset();
    }
  }, [editingRecord]);

  useEffect(() => {
    form.resetFields();
    setEditingRecord(null);
  }, [typeId, match]);

  const handleSubmit = async (values: any) => {
    const body = isEdit
      ? {
          RPWayCode: values.RPWayCode,
          RPWayDesc: values.RPWayDesc,
          [config.idFieldKeyUpdate]: editingRecord?.[config.idFieldKeyUpdate],
          [config.fieldKey]: editingRecord?.[config.fieldKey],
          ChangeFields: changeFields,
        }
      : {
          AccountId: values.AccountId,
          RPWayCode: values.RPWayCode,
          RPWayDesc: values.RPWayDesc,
          [config.idFieldName]: typeId,
        };
    const res = await mutateItem({
      url: isEdit ? config.updateUrl : config.createUrl,
      body,
    }).unwrap();
    if (res?.Result == "Success") {
      showSuccessToast(t("toast.successTitle"));
      form.resetFields();
      setEditingRecord(null);
      match ? refetchTable() : refetchCard();
    }
  };

  return (
    <>
      <Form
        form={form}
        name="rpWayForm"
        layout="vertical"
        onFinish={handleSubmit}
        className="lg:grid lg:grid-cols-12 gap-x-4 items-center"
      >
        <Form.Item
          label="معین"
          name="AccountId"
          className="flex flex-col w-full lg:col-span-6 text-xs"
          rules={[{ required: true, message: t("form.required") }]}
        >
          <DynamicSelect
            showSearch
            allowClear
            optionFilterProp={"label"}
            dynamicValue={{
              addWebUrl: "api/acc/select/account4SelectOption",
              endpoint: "api/acc/select/account4SelectOption",
              level: 3,
              OrderInfo: [{ ColName: "AccountFullCode", Asc: true }],
            }}
            autoFocus
            selectFirstDefault={false}
            displayFormatter={(option) => {
              const text = option?._SelectDisplay || "";
              return text.includes(" - ") ? text.split(" - ")[1] : text;
            }}
            onChange={(value, option: any) => {
              const text = option?.option?._SelectValue;
              if (!text) return;
              const [code, desc] = text.split(" - ");
              form.setFieldsValue({
                RPWayCode: code?.trim(),
                RPWayDesc: desc?.trim(),
              });
            }}
          />
        </Form.Item>
        <Form.Item
          label="کد نحوه"
          name="RPWayCode"
          className="flex flex-col w-full lg:col-span-6 text-xs"
          rules={[{ required: true, message: t("form.required") }]}
        >
          <InputText />
        </Form.Item>
        <Form.Item
          label="شرح نحوه"
          name="RPWayDesc"
          className="flex flex-col w-full lg:col-span-6 text-xs"
          rules={[{ required: true, message: t("form.required") }]}
        >
          <InputText />
        </Form.Item>
        <Form.Item className="col-span-12 lg:col-span-6 m-0 p-0 text-xs">
          <div className="flex justify-end items-center gap-2 pt-1 w-full">
            <CustomTooltip title={t("general.addNew")}>
              <span
                className="bg-gray-gray3 px-2 py-[2.8px] rounded cursor-pointer"
                onClick={() => {
                  reset();
                  setEditingRecord(null);
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
              ) : isEdit ? (
                t("general.update")
              ) : (
                t("general.submit")
              )}
            </CustomButton>
          </div>
        </Form.Item>
      </Form>
    </>
  );
};

export default RpWayFormContext;
