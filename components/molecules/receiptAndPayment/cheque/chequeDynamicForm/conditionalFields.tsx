import { useEffect, useState } from "react";

import { Form } from "antd";
import { useTranslations } from "next-intl";

import { CustomSpin, DynamicSelect } from "@components/atoms/defaultElements";
import type { IAccount } from "@services/acc/account/type";
import { useGetData } from "@services/base";
import type { IRequest, IRpWay } from "@services/trh/rpWay/type";
import type { IRequestConfig } from "@type/elementType";

import type { ICondition } from "../type";

export const ConditionalFields = ({ form }) => {
  const [condition, setCondition] = useState<ICondition>();
  const [accountId, setAccountId] = useState<number>(null);
  const t = useTranslations();

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
    if (rpWayId) {
      const accountId = rpWayData?.Data?.find(
        (item) => item._SelectId === rpWayId
      )?.AccountId;

      if (accountId) {
        setAccountId(accountId);
      }
    }
  }, [rpWayId, rpWayData?.Data]);

  useEffect(() => {
    if (!rpWayId) {
      setAccountId(null);
      setCondition(null);
    }
  }, [rpWayId]);

  return (
    <>
      {/* <div className="flex flex-1 items-end gap-2 h-fit"> */}
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
        />
      </Form.Item>

      {/* </div> */}
      {conditionIsLoading && (
        <div className="flex items-end">
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
          />
        </Form.Item>
      )}
    </>
  );
};
