import {
  useEffect,
  useRef,
} from 'react';

import {
  Form,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import CustomInputNumber from '@components/atoms/defaultElements/inputNumber';
import { SpinIcon } from '@components/atoms/iconComponents';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import { showSuccessToast } from '@utils/toast';

export const GlobalCapacity = () => {
  const t = useTranslations();
  const [form] = Form.useForm();
  const initialValuesRef = useRef<any>(null);

  const { data: defaultValue } = useGetData<any, null>({
    url: "api/sale/select/globalCap",
    body: {
      RepoViewId: 130075,

      ShowBookmarked: true,
      ShowTags: true,
    },
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const handleSubmit = async (values) => {
    try {
      const changedFields: string[] = [];

      Object.keys(values).forEach((key) => {
        if (values[key] !== initialValuesRef.current?.[key]) {
          changedFields.push(key);
        }
      });

      if (changedFields.length > 0) {
        const mutateResult = await mutateItem({
          url: "api/sale/update/globalCap",
          body: {
            ...values,
            // ChangeFields: changedFields,
          },
        }).unwrap();

        if (mutateResult?.Result === "Success") {
          showSuccessToast(t("toast.successTitle"));
        }
      }
    } catch (error) {
      null;
    }
  };

  useEffect(() => {
    if (defaultValue?.Data?.[0]) {
      const data = defaultValue.Data?.map((item) => ({
        GlobalCap: item?.Value !== 0 ? Number(item?.Value) : item?.Value,
      }));

      console.log("data", data);

      form.setFieldsValue(data?.[0]);
      initialValuesRef.current = data;
    }
  }, [defaultValue]);

  return (
    <Form
      form={form}
      name="globalCapacity"
      onFinish={handleSubmit}
      layout="vertical"
      className="flex flex-col gap-2"
    >
      <div className="flex flex-col gap-2">
        <Form.Item
          label="حداکثر تخفیف (%)"
          tooltip="مقدار این فیلد به درصد می باشد"
          name="GlobalCap"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <CustomInputNumber min={0} max={99} controls={false} />
        </Form.Item>
      </div>

      <Form.Item className="col-span-2 m-0 p-0 text-xs">
        <div className="flex justify-end items-center gap-2 pt-2">
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
  );
};
