import { useTranslations } from "next-intl";
import { shallowEqual } from "react-redux";

import { CustomButton, CustomTooltip } from "@components/atoms/defaultElements";
import { Undo } from "@components/atoms/iconComponents";
import CloseButton from "@components/molecules/closeButton";
import ExpandedButton from "@components/molecules/expandedButton";
import { useFormHandlers } from "@hooks/custom";
import { useAppSelector } from "@redux/index";

export default function RepoAssignToolbar() {
  const t = useTranslations();
  const { lang, pages } = useAppSelector((state) => {
    const initPage = state.withPersist.init;

    const lang = state.withPersist.config.lang;
    const pages = state.withPersist.pages;
    return { initPage, lang, pages };
  }, shallowEqual);

  const { handleReset } = useFormHandlers({
    activePage: pages.find((item) => item.isActive),
    pages,
  });

  return (
    <div
      className={`-top-16 absolute  flex gap-4 ${
        lang == "fa" ? "-left-3" : "-right-3"
      }`}
    >
      <CustomTooltip title={t("formToolbar.closePage")}>
        <CloseButton />
      </CustomTooltip>
      <CustomTooltip
        className="bg-gray-gray3 dark:bg-gray-gray11 rounded h-full"
        title={t("general.fullScreenMode")}
        id="fullScreenMode"
      >
        <ExpandedButton />
      </CustomTooltip>

      <CustomTooltip
        title={t("formToolbar.revalidate")}
        className="hidden xxl:block"
      >
        <CustomButton
          type="text"
          className="flex justify-center items-center bg-gray-gray3 !hover:bg-white hover:bg-gray-gray8 dark:bg-gray-gray11 px-[6px] border rounded h-9 text-gray dark:text-white"
          onClick={handleReset}
          id="reload"
        >
          <Undo
            config={{
              width: 24,
              height: 24,
            }}
          />
        </CustomButton>
      </CustomTooltip>
    </div>
  );
}
