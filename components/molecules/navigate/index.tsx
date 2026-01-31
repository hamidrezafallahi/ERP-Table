import { useTranslations } from "next-intl";

import { CustomButton, CustomTooltip } from "@components/atoms/defaultElements";
import { LeftChevron, RightChevron } from "@components/atoms/iconComponents";
import { useNavigateRecordsForm } from "@hooks/custom";
import type { IPage } from "@slice/pages/type";

export default function Navigate({
  listPageId,
  getUrl,
  pages,
  fieldKey,
  id,
  formUrl,
  pageId,
  rootClassName,
}: {
  listPageId: string;
  getUrl: string;
  pages: IPage[];
  fieldKey: string | number;
  id: number;
  formUrl: string;
  pageId: string;
  rootClassName?: string;
}) {
  const t = useTranslations();
  const {
    handleNextItem,
    handlePrevItem,
    disabledNextButton,
    disabledPrevButton,
  } = useNavigateRecordsForm({
    fieldKey,
    formUrl,
    getUrl,
    id,
    listPageId,
    pageId,
    pages,
  });

  return (
    <div className={`flex justify-between gap-2 h-9 ${rootClassName}`}>
      <CustomTooltip title={t("formToolbar.nextRecord")}>
        <CustomButton
          ghost
          className="!bg-gray-gray3 dark:!bg-gray-gray11 !p-0 border-none rounded w-9 h-9"
          onClick={handleNextItem}
          id="nextRecord"
        >
          <RightChevron
            config={{
              width: 34,
              height: 34,
            }}
          />
        </CustomButton>
      </CustomTooltip>
      <CustomTooltip title={t("formToolbar.prevRecord")}>
        <CustomButton
          ghost
          className="!bg-gray-gray3 dark:!bg-gray-gray11 !p-0 border-none rounded w-9 h-9"
          onClick={handlePrevItem}
          id="previousRecord"
        >
          <LeftChevron
            config={{
              width: 34,
              height: 34,
            }}
          />
        </CustomButton>
      </CustomTooltip>
    </div>
  );
}
