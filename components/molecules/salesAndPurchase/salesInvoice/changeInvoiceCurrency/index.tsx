import { useEffect } from 'react';

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
import { SpinIcon } from '@components/atoms/iconComponents';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import type {
  IRequest,
  IStandardSalesInvoice,
} from '@services/sale/standardSalesInvoice/type';
import { showSuccessToast } from '@utils/toast';

export const ChangeInvoiceCurrency = ({ handleClose, sourceKey, id }) => {
  const { data: defaultValue } = useGetData<IStandardSalesInvoice[], IRequest>({
    url: "api/sale/select/invoiceCurrency",
    body: {
      // [sourceKey]: id,
      Id: id,
    },
    skip: !id,
  });

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const t = useTranslations();
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    const defaultCurrencyValue = defaultValue?.Data?.[0]?.["CurrencyId"];
    const defaultCurrencyRateValue = defaultValue?.Data?.[0]?.["CurrencyRate"];
    const currencyValue = values?.["CurrencyId"];
    const currencyRateValue = values?.["CurrencyRate"];

    try {
      if (id) {
        if (
          currencyValue !== defaultCurrencyValue ||
          currencyRateValue !== defaultCurrencyRateValue
        ) {
          const mutateResult = await mutateItem({
            url: "api/sale/update/invoiceCurrency",
            body: {
              ...values,
              [sourceKey]: id,
              ChangeFields: ["CurrencyId", "CurrencyRate"],
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
      name="changeInvoiceCurrency"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col lg:grid lg:grid-cols-2 gap-2 p-4`}
    >
      <Form.Item
        label="نوع ارز"
        name="CurrencyId"
        rules={[
          { required: true, message: "این فیلد الزامی است.", type: "number" },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={{
            addWebUrl: "api/com/select/availableCurrencies4SelectOption",
            endpoint: "api/com/select/availableCurrencies4SelectOption",
            repoViewId: null,
            // addButton: {
            //   url: "com/currency",
            //   RepoId: 106016,
            //   SystemId: SystemEnum.com,
            // },
          }}
          config={{
            name: "CurrencyId",
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      <Form.Item
        label="نرخ ارز"
        name="CurrencyRate"
        rules={[
          { required: false, message: "این فیلد الزامی است.", type: "number" },
        ]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <CustomInputNumber
          min={0}
          controls={false}
          parser={(value) =>
            value?.replace(/\$\s?|(,*)/g, "") as unknown as number
          }
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Form.Item>

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
