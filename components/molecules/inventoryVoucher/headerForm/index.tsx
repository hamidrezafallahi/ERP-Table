"use client";
import {
  Form,
  FormInstance,
} from 'antd';
import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  DynamicSelect,
  NewDatePicker,
} from '@components/atoms/defaultElements';
import InputText from '@components/atoms/defaultElements/inputText';
import Title from '@components/atoms/Title';
import { useAppSelector } from '@redux/index';
import type { IRequestConfig } from '@type/elementType';

interface IProps {
  form: FormInstance;
}
export const InventoryVoucherHeaderForm = ({ ...props }: IProps) => {
  const {NeedReference,VoucherReference,isInventoryTransfer,label,hasThirdParty,tafsiliTypeId}=useAppSelector((state)=>({
    NeedReference:state.withPersist.pages.find(p=>p.isActive)?.data?.NeedReference,
    VoucherReference:state.withPersist.pages.find(p=>p.isActive)?.data?.VoucherReference,
    isInventoryTransfer:state.withPersist.pages.find(p=>p.isActive)?.data?.isInventoryTransfer,
    label:state.withPersist.pages.find(p=>p.isActive)?.data?.label,
    hasThirdParty:state.withPersist.pages.find(p=>p.isActive)?.data?.hasThirdParty,
    tafsiliTypeId:state.withPersist.pages.find(p=>p.isActive)?.data?.tafsiliTypeId
}), shallowEqual);
  const { form } = props;
  const t = useTranslations();

  const sourceConfig: IRequestConfig = {
    endpoint: "api/inv/select/voucher4selectOption",
    repoViewId: null,
    VoucherTypeId: Number(VoucherReference),
  };

  const stockIdConfig: IRequestConfig = {
    addWebUrl: "/api/inv/select/stock4SelectOption",
    endpoint: "/api/inv/select/stock4SelectOption",
    repoViewId: 70004,
  };
  const TafsiliIdConfig: IRequestConfig = {
    endpoint: "/api/acc/select/tafsili4selectOption",
    repoViewId: 70004,
    TafsiliTypeId: Number(tafsiliTypeId),
  };
  return (
    <>
      <Title  captionII={label} />
      <Form
        form={form}
        name="inventoryVoucherHeaderForm"
        layout="vertical"
        className={`flex flex-col gap-2 lg:grid lg:grid-cols-4 lg:gap-3 max-h-[calc(100dvh-160px)] h-auto overflow-y-auto hidden-show-scrollBar`}
      >
        <Form.Item
          label="تاریخ سند"
          name="VoucherDate"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <NewDatePicker
            config={{
              name: "VoucherDate",
              caption: "تاریخ سند",
              type: "date",
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
        {NeedReference && (
          <Form.Item
            label="مرجع"
            name="VoucherHeaderId"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <DynamicSelect
              dynamicValue={sourceConfig}
              showSearch
              allowClear
              showId
              onClear={() => form.setFieldValue("VoucherHeaderId", null)}
              infinite
              config={{
                name: "VoucherHeaderId",
                caption: "مرجع",
                help: "",
                placeHolder: "",
                type: "selectOption",
                selectEndpoint: sourceConfig,
                setFieldValue: form.setFieldValue,
              }}
            />
          </Form.Item>
        )}
        <Form.Item
          label=" نام انبار"
          name="StockId"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={stockIdConfig}
            showSearch
            allowClear
            showId
            onClear={() => form.setFieldValue("", null)}
            infinite
            config={{
              name: "StockId",
              caption: "نام انبار",
              type: "selectOption",
              selectEndpoint: stockIdConfig,
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
        {isInventoryTransfer && (
          <Form.Item
            label="به انبار"
            name="ToStockId"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <DynamicSelect
              dynamicValue={stockIdConfig}
              showSearch
              allowClear
              showId
              onClear={() => form.setFieldValue("", null)}
              infinite
              config={{
                name: "ToStockId",
                caption: "به انبار",
                help: "",
                placeHolder: "",
                type: "selectOption",
                selectEndpoint: stockIdConfig,
                setFieldValue: form.setFieldValue,
              }}
            />
          </Form.Item>
        )}
        {hasThirdParty && (
          <Form.Item
            label="تفصیلی"
            name="TafsiliId"
            rules={[{ required: true, message: t("form.required") }]}
            className="flex flex-col !mb-0 !pb-0 text-xs"
          >
            <DynamicSelect
              dynamicValue={TafsiliIdConfig}
              showSearch
              allowClear
              showId
              onClear={() => form.setFieldValue("", null)}
              infinite
              config={{
                name: "TafsiliId",
                caption: "تفصیلی",
                help: "",
                placeHolder: "",
                type: "selectOption",
                selectEndpoint: TafsiliIdConfig,
                setFieldValue: form.setFieldValue,
              }}
            />
          </Form.Item>
        )}
        <Form.Item
          label="شرح سند"
          name="VoucherDesc"
          rules={[]}
          className="flex flex-col col-span-4 !mb-0 !pb-0 text-xs"
        >
          <InputText
            config={{
              name: "VoucherDesc",
              caption: "شرح سند",
              help: "",
              placeHolder: "",
              type: "text",
              selectEndpoint: {},
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      </Form>
    </>
  );
};
