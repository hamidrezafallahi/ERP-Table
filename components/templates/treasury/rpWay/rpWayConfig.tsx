import { EditIcon, TrashBin } from "@components/atoms/iconComponents";
import { IDynamicModalConfig } from "@components/organisms/sideBarForm/types";

export const rpWayConfig = (
  voucherTypeId: number,
): IDynamicModalConfig => ({
  fieldKey: "RPWayId",
  staticKey: "voucherTypeId",
  deleteUrl: "/api/trh/delete/rpWay",
  createUrl: "/api/trh/insert/rpWay",
  updateUrl: "/api/trh/update/rpWay",
  idFieldName: "VoucherTypeId",
  idFieldKeyUpdate: "RPWayId",
  listConfig: {
    repoViewId: null,
    RepoId: 0,
    selectUrl: "/api/trh/select/rpWay",
    body: { voucherTypeId },
    column: [
      { fieldName: "RPWayCode", fieldCaption: "کد نحوه", fieldType: "string" },
      { fieldName: "RPWayDesc", fieldCaption: "شرح نحوه", fieldType: "string" },
    ],
    IsDefault: true,
    IsDisableAutoRefresh: false,
    IsDisableCommentCount: false,
    IsDisableSidebarStats: false,
    IsDisableCount: false,
    transform: (item) => ({
      ...item,
    }),
  },
  formConfig: { fields: [] },
  sidebarUrl:"/api/trh/select/voucherType4searchBox",
  actions: [
    {
      MenuId: null,
      Icon: <TrashBin />,
      ActionId: null,
      MenuDesc: "حذف",
      key: "حذف",
      FatherId: null,
      MenuType: null,
      WebLink: "",
      loggedInUserId: null,
    },
    {
      MenuId: null,
      Icon: <EditIcon config={{ width: 18, height: 18 }} />,
      ActionId: null,
      MenuDesc: "ویرایش",
      key: "ویرایش",
      FatherId: null,
      MenuType: null,
      loggedInUserId: null,
    },
  ],
});
