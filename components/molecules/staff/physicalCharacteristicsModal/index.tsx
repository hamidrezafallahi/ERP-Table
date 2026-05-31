import {
  useEffect,
  useRef,
} from 'react';

import {
  Form,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  DynamicSelect,
} from '@components/atoms/defaultElements';
import CustomInputNumber from '@components/atoms/defaultElements/inputNumber';
import InputText from '@components/atoms/defaultElements/inputText';
import { SpinIcon } from '@components/atoms/iconComponents';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import type {
  IGood,
  IRequest,
} from '@services/com/good/type';
import { showSuccessToast } from '@utils/toast';

export const PhysicalCharacteristicsModal = ({
  handleClose,
  sourceKey,
  id,
}) => {
  const { data: defaultValue } = useGetData<IGood[], IRequest>({
    url: "api/hr/select/staffPhysical",
    body: {
      RepoViewId: 60006,
      PersonId: id,
    },
    skip: !id,
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();
  const t = useTranslations();
  const [form] = Form.useForm();

  const initialValuesRef = useRef<any>(null);

  const handleSubmit = async (values) => {
    try {
      if (!id) return;

      const changedFields: string[] = [];

      Object.keys(values).forEach((key) => {
        if (values[key] !== initialValuesRef.current?.[key]) {
          changedFields.push(key);
        }
      });

      if (changedFields.length > 0) {
        const mutateResult = await mutateItem({
          url: "api/hr/insert/staffPhysical",
          body: {
            ...values,
            PersonId: id,
            RepoViewId: 30093,
            ChangeFields: changedFields,
          },
        }).unwrap();

        if (mutateResult?.Result === "Success") {
          showSuccessToast(t("toast.successTitle"));
        }
      }

      handleClose();
    } catch (error) {
      null;
    }
  };

  useEffect(() => {
    if (defaultValue?.Data?.[0]) {
      const data = defaultValue.Data[0];
      form.setFieldsValue(data);
      initialValuesRef.current = data;
    }
  }, [defaultValue]);

  return (
    <Form
      form={form}
      name="physicalCharacteristics"
      layout="vertical"
      onFinish={handleSubmit}
      className={`grid grid-cols-12 w-full gap-2 p-4`}
    >
      <Form.Item
        name="Height"
        label="قد"
        className="col-span-12 lg:col-span-2 w-full text-xs"
      >
        <CustomInputNumber controls={false} name="Height" />
      </Form.Item>
      <Form.Item
        name="Weight"
        label="وزن"
        className="col-span-12 lg:col-span-2 w-full text-xs"
      >
        <CustomInputNumber controls={false} name="Weight" />
      </Form.Item>
      <Form.Item
        name="BloodGroupId"
        label="گروه خونی"
        className="col-span-12 lg:col-span-2 w-full text-xs"
      >
        <DynamicSelect
          dynamicValue={{ endpoint: "/api/com/select/commonInfo/bloodType" }}
        />
      </Form.Item>
      <Form.Item
        name="HairColorId"
        label="رنگ مو"
        className="col-span-12 lg:col-span-3 w-full text-xs"
      >
        <DynamicSelect
          dynamicValue={{ endpoint: "/api/com/select/commonInfo/hairColor" }}
        />
      </Form.Item>
      <Form.Item
        name="EyeColorId"
        label="رنگ چشم"
        className="col-span-12 lg:col-span-3 w-full text-xs"
      >
        <DynamicSelect
          dynamicValue={{ endpoint: "/api/com/select/commonInfo/eyeColor" }}
        />
      </Form.Item>

      <Form.Item
        name="ShoeSize"
        label="سایز کفش"
        className="col-span-12 lg:col-span-2 w-full text-xs"
      >
        <CustomInputNumber controls={false} name="ShoeSize" />
      </Form.Item>
      <Form.Item
        name="DressSize"
        label="سایز لباس"
        className="col-span-12 lg:col-span-2 w-full text-xs"
      >
        <CustomInputNumber controls={false} name="DressSize" />
      </Form.Item>
      <Form.Item
        name="XDesc"
        label="توضیحات"
        className="col-span-12 lg:col-span-8 w-full text-xs"
      >
        <InputText name="XDesc" />
      </Form.Item>

      <Form.Item className="col-span-12 m-0 p-0 text-xs">
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
