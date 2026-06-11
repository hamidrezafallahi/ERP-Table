import { IRequestConfig } from "@type/elementType";
import { useMemo } from "react";

export function useVoucherRequestConfigs() {
  return useMemo(() => {
    return {
      cashConfig: {
        addWebUrl: "/api/trh/Select/Cashier4SelectOption",
        endpoint: "/api/trh/Select/Cashier4SelectOption",
        repoViewId: 140002,
      } satisfies IRequestConfig,

      rpWayConfig: {
        addWebUrl: "/api/trh/select/rpWay4voucher",
        endpoint: "/api/trh/select/rpWay4voucher",
        repoViewId: null,
      } satisfies IRequestConfig,
      natureConfig: {
        addWebUrl: "/api/trh/select/commonInfo/voucherNature",
        endpoint: "/api/trh/select/commonInfo/voucherNature",
        repoViewId: null,
      } satisfies IRequestConfig,
      documnetTypeConfig: {
        addWebUrl: "/api/trh/select/voucherType4searchBox",
        endpoint: "/api/trh/select/voucherType4searchBox",
        repoViewId: null,
      } satisfies IRequestConfig,
      issuanceBankConfig: {
        addWebUrl: "/api/trh/select/bankaccount4selectoption",
        endpoint: "/api/trh/select/bankaccount4selectoption",
        repoViewId: null,
      } satisfies IRequestConfig,
    };
  }, []);
}
