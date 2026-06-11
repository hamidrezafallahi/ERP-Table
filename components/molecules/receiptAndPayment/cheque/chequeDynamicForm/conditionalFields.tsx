import { useEffect, useState } from "react";
import { Form } from "antd";
import { useTranslations } from "next-intl";
import { DynamicSelect } from "@components/atoms/defaultElements";
import { useGetData } from "@services/base";
import type { IRequest, IRpWay } from "@services/trh/rpWay/type";
import type { IRequestConfig } from "@type/elementType";
import DynamicLevelFields from "@components/molecules/dynamicLevelFields";
import { chequeDynamicConfig, chequeDynamicConfigMap } from "./config";

export const ConditionalFields = ({ form, type }) => {
  const [accountId, setAccountId] = useState<number>(null);
  const t = useTranslations();
  const rpWayId = Form.useWatch("RpWayId", form);

  const { data: rpWayData } = useGetData<IRpWay[], IRequest>({
    url: "api/trh/select/rpWay4voucher",
    body: {},
  });

  const rpWayConfig: IRequestConfig = {
    addWebUrl: "api/trh/select/rpWay4voucher",
    endpoint: "api/trh/select/rpWay4voucher",
    repoViewId: null,
  };

  useEffect(() => {
    if (rpWayId) {
      const accountId = rpWayData?.Data?.find(
        (item) => item._SelectId === rpWayId,
      )?.AccountId;
      if (accountId) {
        setAccountId(accountId);
      }
    }
  }, [rpWayId, rpWayData?.Data]);

  useEffect(() => {
    if (!rpWayId) {
      setAccountId(null);
    }
  }, [rpWayId]);

  const selectedConfig = chequeDynamicConfigMap.get(type);

  return (
    <>
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
      <DynamicLevelFields
        accountId={accountId}
        form={form}
        level4Type={selectedConfig?.level4Type}
        className="col-span-1"
        withConfig={false}
      />
    </>
  );
};
