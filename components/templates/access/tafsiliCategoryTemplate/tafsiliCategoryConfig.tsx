import { IDynamicModalConfig } from "@components/organisms/sideBarForm/types";
import { EditIcon, TrashBin } from "@components/atoms/iconComponents";

export const tafsiliCategoryConfig = (
  tafsiliCategoryId: number,
): IDynamicModalConfig => ({
  fieldKey: "TafsiliCategoryItemId",
  staticKey: "TafsiliDesc",
  deleteUrlSide: "/api/acc/delete/tafsiliCategory",
  createUrlSide: "/api/acc/insert/tafsiliCategory",
  updateUrlSide: "/api/acc/update/tafsiliCategory",
  deleteUrl: "/api/acc/delete/tafsiliCategoryItem",
  createUrl: "/api/acc/insert/tafsiliCategoryItem",
  updateUrl: "/api/acc/update/tafsiliCategoryItem",
  idFieldName: "TafsiliCategoryId",
  idFieldKeyUpdateSide: "TafsiliCategoryId",
  idFieldKeyUpdate: "TafsiliCategoryItemId",
  listConfig: {
    repoViewId: null,
    RepoId: 0,
    selectUrlSide: "/api/acc/select/tafsiliCategory",
    selectUrl: "/api/acc/select/tafsiliCategoryItem",
    body: { tafsiliCategoryId },
    column: [
      { fieldName: "TafsiliDesc", fieldCaption: "تفصیلی", fieldType: "string" },
    ],
    transform: (item) => ({
      ...item,
      TafsiliDesc: item.Tafsili?.TafsiliDesc,
      TafsiliId: item.Tafsili?.TafsiliId,
    }),
    IsDefault: true,
    IsDisableAutoRefresh: false,
    IsDisableCommentCount: false,
    IsDisableSidebarStats: false,
    IsDisableCount: false,
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
