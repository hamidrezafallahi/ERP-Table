import { TableDynamicModal } from "@components/molecules/dynamicModal";
import type { IPattern } from "@services/mng/pattern/type";

import { patternItemsActions, patternItemsListConfig } from "./config";
import type { IProps } from "./type";

export const PatternItems = ({
  repoId,
  fieldKey,
  locale,
  handleActionClick,
  patterns,
  isFetching,
}: IProps) => {
  const patternsItems = patterns?.map((pattern: IPattern) => ({
    PatternId: pattern.PatternId,
    PatternDesc: pattern.PatternDesc,
    Inactive: pattern.Inactive,
    Pattern: pattern.PatternItem?.slice()
      ?.sort((a, b) => a.Order - b.Order)
      ?.map((item) => {
        return `${item.Separator} ${
          item?.Text ? item.Text : item.PatternObject?.Desc
        }`.trim();
      }),
  }));
  return (
    <TableDynamicModal
      isLoading={isFetching}
      actions={patternItemsActions}
      columnsList={patternItemsListConfig}
      data={patternsItems}
      handleAction={handleActionClick}
      locale={locale}
      fieldKey={fieldKey}
      activation={{
        url: "/api/mng/update/pattern/inActive",
        body: { RepoId: repoId, ChangeFields: ["Inactive"] },
      }}
    />
  );
};
