import { IDynamicModalConfig } from "@components/organisms/sideBarForm/types";
import { IViewData } from "@slice/pages/type";
import {
  baseColumns,
  colsTypeColumnMap,
  levelColumnMap,
  neededFieldsColumns,
} from "./content";

export const comprehensiveReportConfig = (
  viewDataFilter?: Partial<IViewData>,
  mode?: string,
): IDynamicModalConfig => {
  const extraColumns = colsTypeColumnMap[viewDataFilter?.ColsType ?? 0] || [];

  const levelColumns = neededFieldsColumns.flatMap((field) =>
    viewDataFilter?.[field] ? levelColumnMap[field] || [] : [],
  );

  return {
    fieldKey: "AccId",
    staticKey: "",
    deleteUrl: "",
    createUrl: "",
    updateUrl: "",
    idFieldName: "",
    idFieldKeyUpdate: "",
    listConfig: {
      repoViewId: null,
      RepoId: 0,
      selectUrl: "",
      body: {},
      column:
        mode === "Simple"
          ? [...baseColumns, ...extraColumns]
          : [...levelColumns, ...extraColumns],
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
    actions: [],
  };
};
