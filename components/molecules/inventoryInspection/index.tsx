import {
  useEffect,
  useState,
} from 'react';

import {
  Divider,
  Form,
  Radio,
  Spin,
} from 'antd';
import { useTranslations } from 'next-intl';

import {
  CustomButton,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import CustomInputNumber from '@components/atoms/defaultElements/inputNumber';
import InputText from '@components/atoms/defaultElements/inputText';
import { SpinIcon } from '@components/atoms/iconComponents';
import {
  useCUDDataMutation,
  useGetData,
} from '@services/base';
import { ParameterTypeEnum } from '@services/com/goodQc/type';
import type {
  IGoodInfo,
  IRequest,
} from '@services/inv/goodInfo/type';
import { showSuccessToast } from '@utils/toast';

enum fieldType {
  decline = 0,
  accept = 1,
}

export const InventoryInspection = ({ handleClose, uniqueId }) => {
  const [goodId, voucherHeaderId, count] = uniqueId.split("-").map(Number);

  const getInfoUrl = "api/inv/select/goodInfo";
  const getInfoRepoViewId = 70010;
  const insertUrl = "api/inv/insert/inspection";

  const { data: info } = useGetData<IGoodInfo[], IRequest>({
    url: getInfoUrl,
    body: {
      RepoViewId: getInfoRepoViewId,
      GoodId: goodId,
    },
    skip: !goodId,
  });

  const parameters = info?.Data?.[0]?.Parameters || [];
  const IsHasBatchNo = info?.Data?.[0]?.IsHasBatchNo || false;
  const isSerializable = info?.Data?.[0]?.IsSerilizeable || false;
  const MeasureUnitId = info?.Data?.[0]?.MeasureUnitId || null;

  const [mutateItem, { isLoading: mutateIsLoading }] = useCUDDataMutation();
  const t = useTranslations();
  const [form] = Form.useForm();

  const [items, setItems] = useState<
    {
      key: number;
      GoodsInspectionId: number;
      MeasureUnitId: number;
      Value?: number;
      AdmissionResult?: string;
    }[]
  >([]);

  const handleSubmit = async (values) => {
    try {
      if (!goodId || !voucherHeaderId) return;

      const mutateResult = await mutateItem({
        url: insertUrl,
        body: {
          ...values,
          IsAccept: values.IsAccept === fieldType.accept ? true : false,
          Items: items,
          GoodId: goodId,
          VoucherHeaderId: voucherHeaderId,
        },
      }).unwrap();

      if (mutateResult?.Result === "Success") {
        showSuccessToast(t("toast.successTitle"));
      }

      handleClose();
    } catch (error) {
      null;
    }
  };

  const handleChange = (item, body) => {
    const updatedItems = items.map((i) =>
      i.key === item.GoodInspectionId
        ? {
            ...i,
            ...body,
          }
        : i
    );
    setItems(updatedItems);
  };

  useEffect(() => {
    if (parameters.length > 0) {
      const defaultItems = parameters.map((param) => ({
        key: param.GoodInspectionId,
        GoodsInspectionId: goodId,
        MeasureUnitId: MeasureUnitId,
      }));
      setItems(defaultItems);
    }
  }, [parameters]);

  return (
    <Form
      form={form}
      name="goodSettings"
      layout="vertical"
      onFinish={handleSubmit}
      className={`flex flex-col justify-between h-full p-4`}
    >
      <div
        className={`flex flex-col lg:grid lg:grid-cols-2 w-full h-fit gap-2 px-4 `}
      >
        <div className="col-span-2 w-full">
          {parameters?.map((goodInfo) => (
            <div
              key={goodInfo.GoodInspectionId}
              className="flex justify-center items-start [&>div>span]:bg-gray-gray5 w-full [&>div>span]:w-full text-xs [&>div>span]:text-center"
            >
              <div className="flex flex-col gap-2 w-1/6">
                <span className="bg-gray-gray4 p-2 whitespace-nowrap">
                  عنوان ویژگی
                </span>
                <div className="flex flex-col items-center gap-2 p-2">
                  {goodInfo.ParameterName}
                </div>
              </div>
              <div className="flex flex-col gap-2 w-1/6">
                <span className="self-center bg-gray-gray4 p-2 whitespace-nowrap">
                  نوع
                </span>
                <div className="flex flex-col items-center gap-2 p-2">
                  {goodInfo.ParameterType === 1 ? "کمی" : "وصفی"}
                </div>
              </div>
              <div className="flex flex-col gap-2 w-1/6">
                <span className="self-center bg-gray-gray4 p-2 whitespace-nowrap">
                  مقدار پذیرش
                </span>
                <div className="flex flex-col items-center gap-2 p-2">
                  {goodInfo.Target}
                </div>
              </div>
              <div className="flex flex-col gap-2 w-3/6">
                <span className="self-center bg-gray-gray4 p-2 whitespace-nowrap">
                  مقدار سنجش شده
                </span>
                <div className="flex flex-col gap-2">
                  {goodInfo.ParameterType === ParameterTypeEnum.numeric ? (
                    <CustomInputNumber
                      controls={false}
                      onChange={(value) => {
                        const body = {
                          Value: value,
                        };
                        handleChange(goodInfo, body);
                      }}
                    />
                  ) : (
                    <InputText
                      onChange={(e) => {
                        const body = {
                          AdmissionResult: e.target.value,
                        };
                        handleChange(goodInfo, body);
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <Divider className="col-span-2 my-[2px]" />

        <Form.Item
          label="تاریخ انجام آزمایش"
          name="InspectionDate"
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <NewDatePicker />
        </Form.Item>
        <Form.Item
          label="شرح"
          name="Description"
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <InputText />
        </Form.Item>
        {!IsHasBatchNo && !isSerializable ? (
          <Form.Item
            label="تعداد"
            name="AcceptCount"
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <CustomInputNumber controls={false} />
          </Form.Item>
        ) : (
          <div className="flex justify-start items-center gap-2">
            <span>تعداد:</span>
            <span className="font-bold">{count}</span>
          </div>
        )}
        <Form.Item
          label="نوع"
          name="IsAccept"
          rules={[
            {
              required: true,
              message: "این فیلد الزامی است.",
              type: "number",
            },
          ]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <Radio.Group value={fieldType.accept} className="flex gap-16">
            <Radio value={fieldType.accept}>پذیرش</Radio>
            <Radio value={fieldType.decline}>عدم پذیرش</Radio>
          </Radio.Group>
        </Form.Item>
      </div>

      <Form.Item className="col-span-2 m-0 py-2 text-xs">
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
