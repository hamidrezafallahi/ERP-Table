import { EditIcon, TrashBin } from "@components/atoms/iconComponents";
import { IDynamicModalConfig } from "@components/organisms/sideBarForm/type";

export const defaultDescriptionsConfig = (id: number): IDynamicModalConfig => ({
  fieldKey: "AccountDescItemId",
  staticKey: "accountId",
  deleteUrl: "/api/acc/delete/accountDescription",
  createUrl: "/api/acc/insert/accountDescription",
  updateUrl: "/api/acc/update/accountDescription",
  idFieldName: "accountId",
  idFieldKeyUpdate: "AccountDescId",
  listConfig: {
    repoViewId: null,
    RepoId: 0,
    selectUrl: "/api/acc/select/accountDescription",
    body: {
      id,
    },
    column: [
      {
        fieldName: "Desc",
        fieldCaption: "شرح",
        fieldType: "string",
      },
    ],
    IsDefault: false,
    IsDisableAutoRefresh: false,
    IsDisableCommentCount: true,
    IsDisableSidebarStats: true,
    IsDisableCount: true,
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
