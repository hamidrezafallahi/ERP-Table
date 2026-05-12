import { EditIcon, TrashBin } from "@components/atoms/iconComponents";
import { IDynamicModalConfig } from "@components/organisms/sideBarForm/types";

export const voucherTypeConfig = (
  voucherTypeId: number,
): IDynamicModalConfig => ({
  fieldKey: "VocherTypeDescItemId",
  staticKey: "voucherTypeId",
  deleteUrl: "/api/acc/delete/voucherdescriptions",
  createUrl: "/api/acc/insert/voucherTypeDescriptions",
  updateUrl: "/api/acc/update/voucherTypeDescriptions",
  idFieldName: "voucherTypeId",
  idFieldKeyUpdate: "VocherTypeDescId",
  listConfig: {
    repoViewId: null,
    RepoId: 0,
    selectUrl: `/api/acc/select/voucherTypeDescriptions`,
    body: { voucherTypeId },
    column: [{ fieldName: "Desc", fieldCaption: "شرح", fieldType: "string" }],
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
