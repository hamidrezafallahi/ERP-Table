import { useEffect } from 'react';

import {
  Form,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import { SpinIcon } from '@components/atoms/iconComponents';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import type {
  IAccountList,
  IRequest,
} from '@services/mng/accountList/type';
import { showSuccessToast } from '@utils/toast';

export const ExpireDateAccountList = ({ handleClose, sourceKey, id }) => {
  const { data: defaultValue } = useGetData<IAccountList[], IRequest>({
    url: "api/mng/select/accounts",
    body: {
      RepoViewId: 100015,
      // [sourceKey]: id,
      Id: id,
    },
    skip: !id,
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const t = useTranslations();
  const [form] = Form.useForm();
  const formValues = Form.useWatch([], form);

  const handleSubmit = async (values) => {
    const defaultExpireDateValue = defaultValue?.Data?.[0]?.["ExpireDate"];

    const expireDateValue = values?.["ExpireDate"];

    try {
      if (id) {
        if (expireDateValue !== defaultExpireDateValue) {
          const mutateResult = await mutateItem({
            url: "/api/mng/update/expireDateOfAccount",
            body: {
              ...values,
              [sourceKey]: id,
              RepoViewId: null,
              ChangeFields: ["ExpireDate"],
            },
          }).unwrap();
          if (mutateResult?.Result === "Success") {
            showSuccessToast(t("toast.successTitle"));
          }
        }
      }

      handleClose();
    } catch (error) {
      null;
    }
  };

  useEffect(() => {
    if (defaultValue) {
      const data = defaultValue?.Data?.[0];

      form.setFieldsValue(data);
    }
  }, [defaultValue]);

  return (
    <Form
      form={form}
      name="expireDateAccountList"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col lg:grid lg:grid-cols-2 gap-2 p-4`}
    >
      <Form.Item
        label="تاریخ انقضا"
        name="ExpireDate"
        rules={[{ required: true, message: "این فیلد الزامی است." }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <NewDatePicker defaultValue={formValues?.ExpireDate} />
      </Form.Item>

      <Form.Item
        className={` rtl:left-3 right-3 bottom-3 fixed col-span-2 m-0 p-0 text-xs`}
      >
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
