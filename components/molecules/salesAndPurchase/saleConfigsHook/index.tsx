import { IRequestConfig } from "@type/elementType";
import { SystemEnum } from "@type/enum";

export const useSaleConfigs = (IsAnonymous?: boolean) => {
  const customerConfig: IRequestConfig = {
    addWebUrl: "api/sale/select/customer4SelectOption/elk",
    endpoint: "api/sale/select/customer4SelectOption/elk",
    repoViewId: 130045,
    IsAnonymous: IsAnonymous ?? false,
    addButton: {
      url: "sale/customer",
      RepoId: 1012,
      SystemId: SystemEnum.sale,
    },
  };

  const salesTypeConfig: IRequestConfig = {
    addWebUrl: "api/sale/select/type4SelectOption",
    endpoint: "api/sale/select/type4SelectOption",
    repoViewId: 130044,
    addButton: {
      url: "sale/saleType",
      RepoId: 1006,
      SystemId: SystemEnum.sale,
    },
  };

  return { customerConfig, salesTypeConfig };
};
