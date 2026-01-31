import React, {
  useEffect,
  useState,
} from 'react';

import {
  Form,
  Spin,
} from 'antd';
import { Select } from 'antd/lib';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  CustomSelect,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import {
  PlusOutline,
  SpinIcon,
} from '@components/atoms/iconComponents';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import { getSystemNameById } from '@utils/core';

export default function CustomFormWebHook({
  selectedGoodId,
  systemId,
  // onSubmit,
  form,
  editingItem,
  setEditingItem,
}) {
  const t = useTranslations();
  const [protocol, setProtocol] = useState("http://");
  const [changeFields, setChangeFields] = useState([]);
  const [originalValues, setOriginalValues] = useState<Record<
    string,
    any
  > | null>(null);
  const formValues = Form.useWatch([], form);
  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();
  const { Option } = Select;

  const { refetch: ReLoad } = useGetData({
    url: `/api/${getSystemNameById(systemId)}/select/webHook`,
    body: {
      RepoId: selectedGoodId,
    },

    skip: true,
  });

  useEffect(() => {
    if (editingItem) {
      form.setFieldsValue({
        Name: editingItem.Name,
        EndPoint: editingItem.EndPoint?.replace(/^https?:\/\//, ""), // فقط دامنه بدون پروتکل
        SendType: editingItem.SendType,
        ParamType: editingItem.ParamType,
        OpMode: editingItem.OpMode,
        WebHookId: editingItem.WebHookId,
      });
      setProtocol(
        editingItem.EndPoint?.startsWith("https://") ? "https://" : "http://"
      );
    } else {
      form.resetFields();
      setProtocol("http://");
    }
  }, [editingItem, form]);

  const handleSubmit = async (values: any) => {
    const finalEndpoint = `${protocol}${values.EndPoint}`;

    const sendTypeMap = { POST: 1, DELETE: 2, GET: 3 };
    const paramTypeMap = {
      QueryParam: 1,
      JsonBody: 2,
      FormData: 3,
      FormURL: 4,
      NONE: 5,
    };
    const opModeMap = {
      "Add/Insert": 1,
      "Update/Edit": 2,
      Delete: 3,
    };
    const getChangedFields = (values, originalValues) => {
      if (!originalValues) return Object.keys(values); // Insert → همه فیلدها
      return Object.keys(values).filter(
        (key) => values[key] !== originalValues[key]
      );
    };

    const mappedBody = {
      ...values,
      RepoId: selectedGoodId,
      EndPoint: finalEndpoint,
      SendType: sendTypeMap[values.SendType],
      ParamType: paramTypeMap[values.ParamType],
      OpMode: opModeMap[values.OpMode],
      ...(editingItem && {
        ChangeFields: changeFields,
        WebHookId: editingItem.WebHookId,
      }),
    };

    const url = editingItem?.WebHookId
      ? `/api/${getSystemNameById(systemId)}/update/webHook`
      : `/api/${getSystemNameById(systemId)}/insert/webHook`;

    const res = await mutateItem({
      url,
      body: mappedBody,
    }).unwrap();

    if (res?.Result == "Success") {
      form.resetFields();
      setChangeFields([]);
      ReLoad;
    }
  };
  const values = formValues as Record<string, any>;
  useEffect(() => {
    if (originalValues) {
      for (const key in values) {
        if (originalValues[key] !== values[key]) {
          if (!changeFields.includes(key)) {
            setChangeFields((prev) => [...prev, key]);
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!editingItem) return;
    setOriginalValues(editingItem); // مقدار اولیه برای مقایسه
  }, [editingItem]);

  useEffect(() => {
    if (!originalValues) return;
    const changed: string[] = [];
    for (const key in values) {
      if (originalValues[key] !== values[key]) {
        changed.push(key);
      }
    }
    setChangeFields(changed);
  }, [values, originalValues]);

  const sendTypeOptions = [
    { title: "POST", value: "POST" },
    { title: "DELETE", value: "DELETE" },
    { title: "GET", value: "GET" },
  ];

  const allParamTypeOptions = [
    { title: "QueryParam", value: "QueryParam" },
    { title: "JsonBody", value: "JsonBody" },
    { title: "FormData", value: "FormData" },
    { title: "FormURL", value: "FormURL" },
    { title: "NONE", value: "NONE" },
  ];

  const sendType = Form.useWatch("SendType", form);

  const filteredParamTypeOptions = allParamTypeOptions.filter((opt) => {
    if (sendType === "POST")
      return opt.value !== "QueryParam" && opt.value !== "NONE";
    if (sendType === "DELETE") return opt.value === "QueryParam";
    if (sendType === "GET") return ["QueryParam", "NONE"].includes(opt.value);
    return true;
  });

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
          label={t("general.title")}
          name="Name"
          className="lg:flex lg:flex-col col-span-12 lg:col-span-1 text-xs"
          rules={[{ required: true, message: t("form.required") }]}
        >
          <InputText />
        </Form.Item>

        <div className="hidden lg:block lg:col-span-2" />

        <Form.Item
          label="EndPoint"
          name="EndPoint"
          rules={[
            { required: true, message: t("form.required") },
            {
              pattern: /^[A-Za-z0-9.-]+\.[A-Za-z]{2,}.*$/,
              message: "آدرس معتبر نیست",
            },
          ]}
          className="col-span-12 lg:col-span-2"
        >
          <InputText
            addonAfter={
              <Select
                value={protocol}
                onChange={(value) => setProtocol(value)}
                className="w-28 !text-center"
              >
                <Option value="http://"> {` //:http`}</Option>
                <Option value="https://">{` //:https`} </Option>
              </Select>
            }
          />
        </Form.Item>
        <div className="hidden lg:block lg:col-span-1" />
        <Form.Item
          label={t("general.typeOfExtension")}
          name="SendType"
          rules={[{ required: true, message: t("form.required") }]}
          className="col-span-12 lg:col-span-1 lg:!mb-0 lg:!pb-0 text-xs"
        >
          <CustomSelect options={sendTypeOptions} />
        </Form.Item>

        <Form.Item
          label={t("general.parameterType")}
          name="ParamType"
          rules={[{ required: true, message: t("form.required") }]}
          className="col-span-12 lg:col-span-1 lg:!mb-0 lg:!pb-0 text-xs"
        >
          <CustomSelect options={filteredParamTypeOptions} />
        </Form.Item>
        <Form.Item
          label={t("general.operationType")}
          name="OpMode"
          rules={[{ required: true, message: t("form.required") }]}
          className="col-span-12 lg:col-span-1 lg:!mb-0 lg:!pb-0 text-xs"
        >
          <CustomSelect
            options={[
              { title: "1", value: "Add/Insert" },
              { title: "2", value: "Update/Edit" },
              { title: "3", value: "Delete" },
            ]}
          />
        </Form.Item>

        <Form.Item className="col-span-12 lg:col-span-3 m-0 p-0 text-xs">
          <div className="flex justify-end items-center gap-2 pt-1 w-full">
            <CustomTooltip title={t("general.addNew")}>
              <span
                className="px-2 py-[2.8px] bg-gray-gray3 rounded cursor-pointer"
                onClick={() => {
                  setEditingItem(null); // حالت insert
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
