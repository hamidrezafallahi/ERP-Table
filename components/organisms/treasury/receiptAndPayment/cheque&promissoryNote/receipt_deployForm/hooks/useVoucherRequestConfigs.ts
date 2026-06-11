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
    };
  }, []);
}
