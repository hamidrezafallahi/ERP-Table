import {
  Form,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';

import { CustomButton } from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import InputText from '@components/atoms/defaultElements/inputText';
import { SpinIcon } from '@components/atoms/iconComponents';
import { useHandle } from '@hooks/custom';
import { useGetConfigValueById } from '@hooks/custom/useGetConfigValueById';
import { useCUDDataMutation } from '@services/base';
import { showSuccessToast } from '@utils/toast';

export const AccountingLevels = () => {
  const t = useTranslations();
  const [form] = Form.useForm();
  const {handleLogout}=useHandle()
  const lengthOfGroup = useGetConfigValueById({ id: 5001 });
  const lengthOfCol = useGetConfigValueById({ id: 5002 });
  const lengthOfMoeen = useGetConfigValueById({ id: 5003 });
  const decimalAble = useGetConfigValueById({ id: 5004 });
  const decimal = useGetConfigValueById({ id: 5005 });
  const level = useGetConfigValueById({ id: 5006 });
  const initValues = {
    5001: lengthOfGroup.Value,
    5002: lengthOfCol.Value,
    5003: lengthOfMoeen.Value,
    5004: decimalAble.Value === "true",
    5005: decimal.Value,
    5006: level.Value,
  };

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const handleSubmit = async (values) => {
    try {
      const changedFields: string[] = [];
      Object.keys(values).forEach((key) => {
        console.log(values[key],initValues[key])
        if (values[key] !== initValues[key]) {
          changedFields.push(key);
        }
      });

      console.log(Array.from(values));
      if (changedFields.length > 0) {
         const configMap = [
    { key: 5001, data: lengthOfGroup },
    { key: 5002, data: lengthOfCol },
    { key: 5003, data: lengthOfMoeen },
    { key: 5004, data: decimalAble },
    { key: 5005, data: decimal },
    { key: 5006, data: level },
  ];
        const placeConfigs = changedFields.map((key) => {
          const item = configMap.find((c) => String(c.key) === key);

          return {
            PlaceConfigId: Number(key),
            Value: String(values[key]), 
            PlaceValueConfigId: item?.data?.PlaceConfigValueId  
          };
        });
        const mutateResult = await mutateItem({
          url: "api/mng/Update/PlaceConfigValueWithArray",
          body: {
            PlaceConfigs:placeConfigs,
           },
        }).unwrap();
        if (mutateResult?.Result === "Success") {
          showSuccessToast("به دلیل اینکه تنظیمات سیستم شما تغییر کرده است نیاز به خروج و ورود مجدد دارید ",t("toast.successTitle"));
        setTimeout(() => {
          handleLogout()
        }, 2000);
        }
      }
    } catch (error) {
      null;
    }
  };

  const isDecimal = Form.useWatch(5004, form);
  return (
    <Form
      form={form}
      name="accountingLevels"
      onFinish={handleSubmit}
      initialValues={{
        5001: lengthOfGroup.Value,
        5002: lengthOfCol.Value,
        5003: lengthOfMoeen.Value,
        5004: decimalAble.Value === "true",
        5005: decimal.Value,
        5006: level.Value,
      }}
      layout="vertical"
      className="flex flex-col gap-2"
    >
      <Form.Item
        label="تعداد سطوح حسابداری"
        name={5006}
        className="flex flex-col !mb-0 !pb-0 text-xs"
        getValueFromEvent={(e) => e.target.value.replace(/\D/g, "")}
        rules={[
          {
            validator(_, value) {
              if (!value) return Promise.resolve();
              const num = Number(value);
              if (num >= 5 && num <= 13) return Promise.resolve();
              return Promise.reject("عدد باید بین 5 تا 13 باشد");
            },
          },
        ]}
      >
        <InputText placeholder="طول کد" />
      </Form.Item>
      <Form.Item
        label="طول کد حسابهای گروه"
        name={5001}
        className="flex flex-col !mb-0 !pb-0 text-xs"
        getValueFromEvent={(e) => e.target.value.replace(/\D/g, "")}
        rules={[
          {
            validator(_, value) {
              if (!value) return Promise.resolve();
              const num = Number(value);
              if (num <= 10) return Promise.resolve();
              return Promise.reject("عدد باید تا 10 باشد");
            },
          },
        ]}
      >
        <InputText placeholder="طول کد" />
      </Form.Item>
      <Form.Item
        label="طول کد حسابهای کل"
        name={5002}
        className="flex flex-col !mb-0 !pb-0 text-xs"
        getValueFromEvent={(e) => e.target.value.replace(/\D/g, "")}
        rules={[
          {
            validator(_, value) {
              if (!value) return Promise.resolve();
              const num = Number(value);
              if (num <= 10) return Promise.resolve();
              return Promise.reject("عدد باید تا 10 باشد");
            },
          },
        ]}
      >
        <InputText placeholder="طول کد" />
      </Form.Item>
      <Form.Item
        label="طول کد حسابهای معین"
        name={5003}
        className="flex flex-col !mb-0 !pb-0 text-xs"
        getValueFromEvent={(e) => e.target.value.replace(/\D/g, "")}
        rules={[
          {
            validator(_, value) {
              if (!value) return Promise.resolve();
              const num = Number(value);
              if (num <= 10) return Promise.resolve();
              return Promise.reject("عدد باید تا 10 باشد");
            },
          },
        ]}
      >
        <InputText placeholder="طول کد" />
      </Form.Item>

      <div className="flex items-center gap-4 pt-10 h-8">
        <Form.Item
          layout="horizontal"
          label="اعداد اعشاری"
          name={5004}
          valuePropName="checked"
          className="!mb-0"
        >
          <CustomCheckbox />
        </Form.Item>

        {isDecimal && (
          <Form.Item
            label="تعداد اعشار"
            layout="horizontal"
            name={5005}
            className="flex flex-col !mb-0 !pb-0 text-xs"
            getValueFromEvent={(e) => e.target.value.replace(/\D/g, "")}
            rules={[
              {
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  const num = Number(value);
                  if (num <= 2) return Promise.resolve();
                  return Promise.reject("عدد باید تا 2 باشد");
                },
              },
            ]}
          >
            <InputText />
          </Form.Item>
        )}
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
