import React, { useEffect } from 'react';

import type { FormInstance } from 'antd/es/form';
import { Form } from 'antd/lib';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  DynamicSelect,
} from '@components/atoms/defaultElements';
import CustomCheckbox from '@components/atoms/defaultElements/checkbox';
import CustomInputNumber from '@components/atoms/defaultElements/inputNumber';
import InputText from '@components/atoms/defaultElements/inputText';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  useGetConditionallyMutation,
  useGetData,
} from '@services/base';
import {
  setAllPageData,
  setPageState,
} from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import { IRequestConfig } from '@type/elementType';

interface MessageFormProps {
  form: FormInstance;
}
interface IDefaultResponse {}
interface IDefaultRequest {
  data: {
    MemoId: string;
    EconumicNumber: string;
    IsAuto: boolean;
    AutoSendDuration: number;
    StartNumber: number;
    IsSendByMoatamed: boolean;
    Cert: string;
    CSR: string;
    MoadianMoatamedId: number;
  };
}

export default function TaxPayersSettingForm({ ...props }: MessageFormProps) {
  const { form } = props;
  const { activePage, match } = useAppSelector((state) => {
    const activePage = state.withPersist.pages?.find((item) => item.isActive);
    const match = state.withPersist.config.initMatch;
    return { activePage, match };
  }, shallowEqual);
  const dispatch = useDispatch();
  const [insetTaxpayersSetting, { data, isLoading: insertIsLoading }] =
    useGetConditionallyMutation();
  const t = useTranslations();

  const {
    data: defaultSetting,
    isLoading,
    refetch,
  } = useGetData<IDefaultRequest, IDefaultResponse>({
    url: "api/moadian/select/moadianConfig",
    body: {
      RepoId: activePage?.RepoId,
    },
    skip: !activePage?.RepoId,
  });
  const handleSubmitForm = async (values) => {
    const insertRes = await insetTaxpayersSetting({
      url: "api/moadian/insert/moadianConfig",
      body: {
        IsSendByMoatamed: values.IsSendByMoatamed,
        MemoId: values.MemoId,
        EconumicNumber: values.EconomicNumber,
        IsAuto: values.IsAuto,
        StartNumber: values.StartNumber,
        AutoSendDuration:
          values.IsAuto !== true ? undefined : values.AutoSendDuration,
        MoadianMoatamedId:
          values.IsSendByMoatamed !== true
            ? undefined
            : values.MoadianMoatamedId,
      },
    }).unwrap();
    if (insertRes?.Result == "Success") {
      dispatch(
        setPageState({
          ...activePage,
          pageState: PageStateEnum.Saved,
        })
      );
      refetch();
    }
  };
  const trustedCompanyDynamicValue: IRequestConfig = {
    endpoint: "api/moadian/select/moadianMotamed4SelectOption",
    repoViewId: 130074,
  };

  useEffect(() => {
    if (defaultSetting?.Data) {
      const element = defaultSetting.Data[0];
      Object.entries(element).forEach(([key, value]) => {
        form.setFieldValue(key, value);
      });
      const formData = Object.entries(element).map(([key, value]) => ({
        name: key,
        value: value,
      }));
      dispatch(setAllPageData(formData));
    }
  }, [defaultSetting]);
  const autoSend = Form.useWatch("IsAuto", form);
  const motamedSend = Form.useWatch("IsSendByMoatamed", form);
  return (
    <>
      <Form
        form={form}
        layout="vertical"
        name="messaging"
        className="hidden-show-scrollBar gap-4 gap-y-8 grid grid-cols-2 pt-10 w-full h-fit overflow-y-auto"
        onFinish={handleSubmitForm}
      >
        <Form.Item
          className="col-span-2 sm:col-span-1"
          name={"MemoId"}
          label={"کد حافظه مالیاتی"}
          rules={[
            { required: true, message: t("form.required") },
            { message: "حداکثر 6 رقم وارد شود", max: 6 },
          ]}
        >
          <InputText config={{ name: "MemoId" }} name="MemoId" />
        </Form.Item>

        <Form.Item
          className="col-span-2 sm:col-span-1"
          name={"EconumicNumber"}
          label={"شماره اقتصادی"}
        >
          <InputText
            config={{
              name: "EconumicNumber",
              setFieldValue: form.setFieldValue,
            }}
            name="EconumicNumber"
          />
        </Form.Item>

        <div
          className={`relative col-span-2 sm:col-span-1 !mb-0 border border-dashed  w-full h-24   `}
        >
          <Form.Item
            className="-top-3 absolute bg-main-white !mb-0 px-2 w-fit text-xs"
            name={"IsAuto"}
          >
            <CustomCheckbox
              config={{ name: "IsAuto", setFieldValue: form.setFieldValue }}
            />
            <span className="px-2">{"ارسال به صورت خودکار"}</span>
          </Form.Item>

          {autoSend && (
            <Form.Item
              name={"AutoSendDuration"}
              label={"ارسال پس از (ساعت)"}
              className="m-0 p-0 pt-4"
            >
              <CustomInputNumber
                controls={false}
                config={{
                  name: "AutoSendDuration",
                  setFieldValue: form.setFieldValue,
                }}
              />
            </Form.Item>
          )}
        </div>

        <Form.Item
          className="col-span-2 sm:col-span-1"
          name={"StartNumber"}
          label={"شماره شروع"}
        >
          <CustomInputNumber
            controls={false}
            config={{ name: "StartNumber", setFieldValue: form.setFieldValue }}
          />
        </Form.Item>
        <div
          className={`relative col-span-2 sm:col-span-1 !mb-0 border border-dashed  w-full h-24   `}
        >
          <Form.Item
            className="-top-3 absolute bg-main-white !mb-0 px-2 w-fit text-xs"
            name={"IsSendByMoatamed"}
          >
            <CustomCheckbox
              config={{
                name: "IsSendByMoatamed",
                setFieldValue: form.setFieldValue,
              }}
            />
            <span className="px-2">{"ارسال توسط معتمد"}</span>
          </Form.Item>

          {motamedSend && (
            <Form.Item
              name={"MoadianMoatamedId"}
              label={"شرکت معتمد"}
              className="m-0 p-0 pt-4"
            >
              <DynamicSelect
                showSearch
                dynamicValue={trustedCompanyDynamicValue}
                infinite
                showId
                config={{
                  name: "MoadianMoatamedId",
                  setFieldValue: form.setFieldValue,
                }}
                form={form}
              />
            </Form.Item>
          )}
        </div>

        {!match && (
          <div className="bottom-0 left-0 z-50 fixed flex items-center bg-main-white px-4 border w-full h-20">
            <CustomButton
              type="text"
              onClick={() => {
                console.log("click");
              }}
              className="bg-main-black dark:bg-main-white w-full h-10 text-main-white dark:text-main-black"
            >
              {t("general.save")}
            </CustomButton>
          </div>
        )}
      </Form>
    </>
  );
}
