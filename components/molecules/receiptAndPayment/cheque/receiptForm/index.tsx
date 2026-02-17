import { useEffect, useState } from "react";

import { Form } from "antd";
import { useTranslations } from "next-intl";

import {
  CustomSpin,
  DynamicSelect,
  NewDatePicker,
} from "@components/atoms/defaultElements";
import InputText from "@components/atoms/defaultElements/inputText";
import type { IAccount } from "@services/acc/account/type";
import { useGetData } from "@services/base";
import type { IRequest, IRpWay } from "@services/trh/rpWay/type";
import type { IRequestConfig } from "@type/elementType";

import type { ICondition, IProps } from "./type";

export const ReceiptChequeForm = ({ activePage, form }: IProps) => {
  const t = useTranslations();
  const [condition, setCondition] = useState<ICondition>();
  const [accountId, setAccountId] = useState<number>(null);
  const rpWayId = Form.useWatch("RpWayId", form);

  const { data: rpWayData } = useGetData<IRpWay[], IRequest>({
    url: "api/trh/select/rpWay4voucher",
    body: {},
  });

  const { data: accountData, isFetching: conditionIsLoading } = useGetData<
    IAccount[],
    IRequest
  >({
    url: "/api/acc/select/account",
    body: {
      RepoViewId: 10001,
      Id: accountId,
    },
    skip: !accountId,
    id: rpWayId,
  });

  // const receiptStatementOrderConfig: IRequestConfig = {
  //   addWebUrl: "",
  //   endpoint: "",
  //   repoViewId: 0,
  // };
  // const receiptEssenceConfig: IRequestConfig = {
  //   addWebUrl: "",
  //   endpoint: "",
  //   repoViewId: 0,
  // };
  // const voucherTypeConfig: IRequestConfig = {
  //   addWebUrl: "/api/com/select/voucherType4Voucher",
  //   endpoint: "/api/com/select/voucherType4Voucher",
  //   repoViewId: 30085,
  // };
  const cashConfig: IRequestConfig = {
    addWebUrl: "/api/trh/Select/Cashier4SelectOption",
    endpoint: "/api/trh/Select/Cashier4SelectOption",
    repoViewId: 140002,
  };
  const rpWayConfig: IRequestConfig = {
    addWebUrl: "api/trh/select/rpWay4voucher",
    endpoint: "api/trh/select/rpWay4voucher",
    repoViewId: null,
  };
  const level4Config: IRequestConfig = {
    addWebUrl: "/api/acc/select/tafsiliLevel4",
    endpoint: "/api/acc/select/tafsiliLevel4",
    AccountId: accountId,
    repoViewId: 10017,
  };
  const level5Config: IRequestConfig = {
    addWebUrl: "/api/acc/select/tafsiliLevel5",
    endpoint: "/api/acc/select/tafsiliLevel5",
    AccountId: accountId,
  };
  const level6Config: IRequestConfig = {
    addWebUrl: "/api/acc/select/tafsiliLevel6",
    endpoint: "/api/acc/select/tafsiliLevel6",
    AccountId: accountId,
  };
  const level7Config: IRequestConfig = {
    addWebUrl: "/api/acc/select/tafsiliLevel7",
    endpoint: "/api/acc/select/tafsiliLevel7",
    AccountId: accountId,
  };
  const level8Config: IRequestConfig = {
    addWebUrl: "/api/acc/select/tafsiliLevel8",
    endpoint: "/api/acc/select/tafsiliLevel8",
    AccountId: accountId,
  };
  const level9Config: IRequestConfig = {
    addWebUrl: "/api/acc/select/tafsiliLevel9",
    endpoint: "/api/acc/select/tafsiliLevel9",
    AccountId: accountId,
  };
  const level10Config: IRequestConfig = {
    addWebUrl: "/api/acc/select/tafsiliLevel10",
    endpoint: "/api/acc/select/tafsiliLevel10",
    AccountId: accountId,
  };
  const level11Config: IRequestConfig = {
    addWebUrl: "/api/acc/select/tafsiliLevel11",
    endpoint: "/api/acc/select/tafsiliLevel11",
    AccountId: accountId,
  };
  const level12Config: IRequestConfig = {
    addWebUrl: "/api/acc/select/tafsiliLevel12",
    endpoint: "/api/acc/select/tafsiliLevel12",
    AccountId: accountId,
  };
  const level13Config: IRequestConfig = {
    addWebUrl: "/api/acc/select/tafsiliLevel13",
    endpoint: "/api/acc/select/tafsiliLevel13",
    AccountId: accountId,
  };
  const natureConfig: IRequestConfig = {
    addWebUrl: "api/trh/select/commonInfo/voucherNature",
    endpoint: "api/trh/select/commonInfo/voucherNature",
    repoViewId: null,
  };

  useEffect(() => {
    const exactItem = accountData?.Data && accountData?.Data[0];
    if (exactItem) {
      setCondition({
        HasTafsili: exactItem.HasTafsili,
        HasFifth: exactItem.HasFifth,
        HasSixth: exactItem.HasSixth,
        HasSeventh: exactItem.HasSeventh,
        HasEight: exactItem.HasEight,
        HasNine: exactItem.HasNine,
        HasTen: exactItem.HasTen,
        HasEleven: exactItem.HasEleven,
        HasTwelve: exactItem.HasTwelve,
        HasThirteen: exactItem.HasThirteen,
      });
    }
  }, [accountData?.Data]);

  useEffect(() => {
    const rpWayDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "RpWayId",
    )?.originalValue;
    const rpWayValue = activePage?.pageData?.find(
      (item) => item.name === "RpWayId",
    )?.value;
    const tafsiliIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "TafsiliId",
    )?.originalValue;
    const fifthIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "FifthId",
    )?.originalValue;
    const sixthIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "SixthId",
    )?.originalValue;
    const seventhIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "SeventhId",
    )?.originalValue;
    const eightIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "EightId",
    )?.originalValue;
    const nineIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "NineId",
    )?.originalValue;
    const tenIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "TenId",
    )?.originalValue;
    const elevenIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "ElevenId",
    )?.originalValue;
    const twelveIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "TwelveId",
    )?.originalValue;
    const thirteenIdDefaultValue = activePage?.pageData?.find(
      (item) => item.name === "ThirteenId",
    )?.originalValue;

    if (rpWayDefaultValue === rpWayValue) {
      form.setFieldValue("RpWayId", rpWayDefaultValue);
      setCondition({
        HasTafsili: !!tafsiliIdDefaultValue,
        HasFifth: !!fifthIdDefaultValue,
        HasSixth: !!sixthIdDefaultValue,
        HasSeventh: !!seventhIdDefaultValue,
        HasEight: !!eightIdDefaultValue,
        HasNine: !!nineIdDefaultValue,
        HasTen: !!tenIdDefaultValue,
        HasEleven: !!elevenIdDefaultValue,
        HasTwelve: !!twelveIdDefaultValue,
        HasThirteen: !!thirteenIdDefaultValue,
      });
    }
  }, [activePage]);

  useEffect(() => {
    if (rpWayId) {
      const accountId = rpWayData?.Data?.find(
        (item) => item._SelectId === rpWayId,
      )?.AccountId;
      if (accountId) {
        setAccountId(accountId);
      }
    } else {
      setAccountId(null);
      setCondition(null);
    }
  }, [rpWayId, rpWayData?.Data]);

  return (
    <Form
      form={form}
      name="receiptChequeForm"
      layout="vertical"
      className={`flex flex-col gap-2 lg:grid lg:grid-cols-4 lg:gap-3 max-h-[calc(100dvh-160px)] h-auto overflow-y-auto hidden-show-scrollBar`}
    >
      {/* <Form.Item
        label="شماره سند"
        name="VoucherNumber"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <CustomInputNumber
            controls={false}
            min={0}
            disabled
            config={{
              name: "VoucherNumber",
              caption: "شماره فاکتور",
              help: "",
              placeHolder: "",
              type: "number",
              selectEndpoint: {},
              setFieldValue: form.setFieldValue,
            }}
          />
      </Form.Item> */}
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

      <Form.Item
        label="صندوقدار"
        name="CashierId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={cashConfig}
          showSearch
          allowClear
          onClear={() => form.setFieldValue("CashierId", null)}
          infinite
          config={{
            name: "CashierId",
            caption: "صندوقدار",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: cashConfig,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      {/* <Form.Item
        label="نوع سند"
        name="VoucherTypeId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={voucherTypeConfig}
          showSearch
          allowClear
          showId
          onClear={() => form.setFieldValue("", null)}
          infinite
          config={{
            name: "VoucherTypeId",
            caption: "نوع سند",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: voucherTypeConfig,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item> */}
      <Form.Item
        label="ماهیت سند"
        name="VoucherNatureId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={natureConfig}
          showSearch
          allowClear
          onClear={() => form.setFieldValue("VoucherNature", null)}
          infinite
          config={{
            name: "VoucherNatureId",
            caption: "ماهیت سند",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: natureConfig,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      {/* <Form.Item
        name=""
        rules={[]}
        className="flex items-end !mb-0 !pb-0 text-xs"
      >
        <CustomCheckbox
          className="w-full"
          config={{
            name: "",
            caption: "تضمینی فاقد سررسید",
            help: "",
            placeHolder: "",
            type: "text",
            selectEndpoint: {},
            setFieldValue: form.setFieldValue,
          }}
        >
          <div className="flex text-xs">تضمینی فاقد سررسید</div>
        </CustomCheckbox>
      </Form.Item> */}
      <Form.Item
        label="نحوه دریافت و پرداخت"
        name="RpWayId"
        rules={[{ required: true, message: t("form.required") }]}
        className="flex flex-col !mb-0 !pb-0 text-xs"
      >
        <DynamicSelect
          dynamicValue={rpWayConfig}
          showSearch
          allowClear
          onClear={() => form.setFieldValue("RpWayId", null)}
          infinite
          config={{
            name: "RpWayId",
            caption: "نحوه دریافت و پرداخت",
            help: "",
            placeHolder: "",
            type: "selectOption",
            selectEndpoint: rpWayConfig,
            setFieldValue: form.setFieldValue,
          }}
        />
      </Form.Item>
      {conditionIsLoading && (
        <div className="flex">
          <CustomSpin />
        </div>
      )}

      {condition?.HasTafsili && (
        <Form.Item
          label="سطح 4"
          name="TafsiliId"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={level4Config}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("TafsiliId", null)}
            infinite
            config={{
              name: "TafsiliId",
              caption: "سطح 4",
              help: "",
              placeHolder: "",
              type: "selectOption",
              selectEndpoint: level4Config,
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      )}
      {condition?.HasFifth && (
        <Form.Item
          label="سطح 5"
          name="FifthId"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={level5Config}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("FifthId", null)}
            infinite
            config={{
              name: "FifthId",
              caption: "سطح 5",
              help: "",
              placeHolder: "",
              type: "selectOption",
              selectEndpoint: level5Config,
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      )}
      {condition?.HasSixth && (
        <Form.Item
          label="سطح 6"
          name="SixthId"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={level6Config}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("SixthId", null)}
            infinite
            config={{
              name: "SixthId",
              caption: "سطح 6",
              help: "",
              placeHolder: "",
              type: "selectOption",
              selectEndpoint: level6Config,
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      )}
      {condition?.HasSeventh && (
        <Form.Item
          label="سطح 7"
          name="SeventhId"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={level7Config}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("SeventhId", null)}
            infinite
            config={{
              name: "SeventhId",
              caption: "سطح 7",
              help: "",
              placeHolder: "",
              type: "selectOption",
              selectEndpoint: level7Config,
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      )}
      {condition?.HasEight && (
        <Form.Item
          label="سطح 8"
          name="EightId"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={level8Config}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("EightId", null)}
            infinite
            config={{
              name: "EightId",
              caption: "سطح 8",
              help: "",
              placeHolder: "",
              type: "selectOption",
              selectEndpoint: level8Config,
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      )}
      {condition?.HasNine && (
        <Form.Item
          label="سطح 9"
          name="NineId"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={level9Config}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("NineId", null)}
            infinite
            config={{
              name: "NineId",
              caption: "سطح 9",
              help: "",
              placeHolder: "",
              type: "selectOption",
              selectEndpoint: level9Config,
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      )}
      {condition?.HasTen && (
        <Form.Item
          label="سطح 10"
          name="TenId"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={level10Config}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("TenId", null)}
            infinite
            config={{
              name: "TenId",
              caption: "سطح 10",
              help: "",
              placeHolder: "",
              type: "selectOption",
              selectEndpoint: level10Config,
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      )}
      {condition?.HasEleven && (
        <Form.Item
          label="سطح 11"
          name="ElevenId"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={level11Config}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("ElevenId", null)}
            infinite
            config={{
              name: "ElevenId",
              caption: "سطح 11",
              help: "",
              placeHolder: "",
              type: "selectOption",
              selectEndpoint: level11Config,
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      )}
      {condition?.HasTwelve && (
        <Form.Item
          label="سطح 12"
          name="TwelveId"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={level12Config}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("TwelveId", null)}
            infinite
            config={{
              name: "TwelveId",
              caption: "سطح 12",
              help: "",
              placeHolder: "",
              type: "selectOption",
              selectEndpoint: level12Config,
              setFieldValue: form.setFieldValue,
            }}
          />
        </Form.Item>
      )}
      {condition?.HasThirteen && (
        <Form.Item
          label="سطح 13"
          name="ThirteenId"
          rules={[{ required: true, message: t("form.required") }]}
          className="flex flex-col !mb-0 !pb-0 text-xs"
        >
          <DynamicSelect
            dynamicValue={level13Config}
            showSearch
            allowClear
            onClear={() => form.setFieldValue("ThirteenId", null)}
            infinite
            config={{
              name: "ThirteenId",
              caption: "سطح 13",
              help: "",
              placeHolder: "",
              type: "selectOption",
              selectEndpoint: level13Config,
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
  );
};
