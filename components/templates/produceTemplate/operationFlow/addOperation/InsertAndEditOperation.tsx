import React, { useEffect } from 'react';

import {
  Checkbox,
  Form,
  Input,
  Select,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import { CustomButton } from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import { SpinIcon } from '@components/atoms/iconComponents';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useCUDDataMutation } from '@services/base';
import { showSuccessToast } from '@utils/toast';

import {
  AddNodeModalProps,
  IFlowItem,
  typeToSelect,
} from '../type';

export default function InsertAndEditOperation({
  onClose,
  setFlowItems,
  editNode,
  flowItems,
}: AddNodeModalProps) {
  const [form] = Form.useForm();
  const noMachine = Form.useWatch("notMachin", form);

  const t = useTranslations();

  const [triggerItem, { isLoading: triggerItemIsLoading }] =
    useCUDDataMutation();

  const isEditMode = !!editNode;

  const { selectedVersionId } = useAppSelector(
    (state) => ({
      selectedVersionId: state.withPersist.pages
        .find((p) => p.isActive)
        ?.pageData?.find((pd) => pd.name === "selectedVersionId")?.value,
    }),
    shallowEqual
  );

  const handleSubmit = async (values: any) => {
    const order = values.order ?? flowItems.length + 1;

    const node: IFlowItem = {
      title: values.title,
      notMachin: values.notMachin,
      time: values.time,
      type:
        values.type === "1"
          ? "circle"
          : values.type === "2"
          ? "square"
          : "circleInSquare",
      order,
    };

    if (isEditMode) {
      const changeFields: string[] = [];

      if (node.title !== editNode.title) changeFields.push("OprationName");
      if (node.type !== editNode.type) changeFields.push("OprationType");
      if (node.notMachin !== editNode.notMachin) changeFields.push("NoMachin");
      if (node.time !== editNode.time) changeFields.push("Time");

      if (changeFields.length === 0) return;

      const res: any = await triggerItem({
        url: "/api/prd/update/sPlanOpc",
        body: {
          SPlanOpcId: Number(editNode.id),
          ChangeFields: changeFields,
          Order: editNode.order,
          OprationName: node.title,
          NoMachin: node.notMachin,
          Time: Number(node.time),
          OprationType:
            node.type === "circle" ? 0 : node.type === "square" ? 1 : 2,
        },
      }).unwrap();
      if (res.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        setFlowItems((prev) =>
          prev.map((item) =>
            item.id === editNode.id ? { ...item, ...node } : item
          )
        );
        onClose?.();
      }
    } else {
      const lastOrder =
        flowItems.length > 0
          ? Math.max(...flowItems.map((item) => Number(item.order) || 0))
          : 0;
      const newOrderValue = lastOrder + 1;

      const result: any = await triggerItem({
        url: "/api/prd/insert/sPlanOpc",
        body: {
          ReturnInsertedRow: true,
          RepoViewId: 150004,
          SPlanId: selectedVersionId,
          OprationName: node.title,
          Order: newOrderValue,
          NoMachin: node.notMachin,
          Time: Number(node.time),

          OprationType:
            node.type === "circle" ? 0 : node.type === "square" ? 1 : 2,
        },
      }).unwrap();

      if (result.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
        const newNode: IFlowItem = {
          id: Number(result.Data?.SPlanOpcId),
          ...node,
          order: newOrderValue,
        };
        setFlowItems((prev) => [...prev, newNode]);
        onClose?.();
      }
    }
  };

  useEffect(() => {
    if (isEditMode && editNode) {
      form.setFieldsValue({
        title: editNode.title,
        type: typeToSelect[editNode.type],
        order: editNode.order ?? flowItems.length + 1,
        notMachin: editNode.notMachin,
        time:
          editNode.time && !isNaN(Number(editNode.time))
            ? Number(editNode.time)
            : null,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        order: flowItems.length + 1,
        NoMachin: false,
        time: null,
      });
    }
  }, [editNode, flowItems]);

  return (
    <Form
      form={form}
      layout="vertical"
      className="flex flex-col justify-between p-4 rounded-lg h-full"
      style={{ direction: "rtl" }}
      onFinish={handleSubmit}
      validateTrigger="onSubmit"
    >
      <div className="gap-x-3 grid lg:grid-cols-2">
        <Form.Item
          label={t("general.operationName")}
          name="title"
          rules={[
            { required: true, message: t("general.thisFieldIsRequired") },
          ]}
        >
          <Input
            placeholder={t("general.enterTheOperationName")}
            className="bg-gray-gray3 !border-none h-9 text-xs"
          />
        </Form.Item>

        <Form.Item
          label={t("general.type")}
          name="type"
          rules={[
            { required: true, message: t("general.thisFieldIsRequired") },
          ]}
        >
          <Select
            showSearch
            className="bg-gray-gray3 w-full h-9"
            placeholder={t("general.selectOperationType")}
            options={[
              { label: t("general.addOperation"), value: "1" },
              { label: t("general.controlOperations"), value: "2" },
              { label: t("general.controlPersonOperation"), value: "3" },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="notMachin"
          label=""
          valuePropName="checked"
          className="mt-5 w-full"
        >
          <Checkbox>{t("general.withoutACar")}</Checkbox>
        </Form.Item>

        {noMachine && (
          <Form.Item
            label={t("general.time")}
            name="time"
            rules={[
              {
                required: noMachine,
                message: t("general.thisFieldIsRequired"),
              },
            ]}
          >
            <InputText
              inputMode="decimal"
              value={form.getFieldValue("time")}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9.]/g, ""); // فقط عدد و نقطه
                form.setFieldValue("time", val ? val : null);
              }}
              onKeyDown={(e) => {
                const allowed =
                  (e.key >= "0" && e.key <= "9") ||
                  e.key === "." ||
                  [
                    "Backspace",
                    "Delete",
                    "ArrowLeft",
                    "ArrowRight",
                    "Tab",
                  ].includes(e.key);
                if (!allowed) e.preventDefault();
              }}
            />
          </Form.Item>
        )}
      </div>

      <div className="flex justify-center lg:justify-end items-center lg:mt-4">
        <CustomButton
          className="bg-main-black !rounded w-full lg:w-20 h-10 text-white"
          htmlType="submit"
        >
          {triggerItemIsLoading ? (
            <Spin size="large" indicator={<SpinIcon />} />
          ) : (
            t("general.submit")
          )}
        </CustomButton>
      </div>
    </Form>
  );
}
