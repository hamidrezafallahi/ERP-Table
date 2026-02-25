import {
  CustomButton,
  CustomTooltip,
  CustomTour,
} from "@components/atoms/defaultElements";
import {
  GuidanceIcon,
  Reload,

} from "@components/atoms/iconComponents";
import CloseButton from "@components/molecules/closeButton";
import ExpandedButton from "@components/molecules/expandedButton";
import { useAppSelector } from "@redux/index";
import { TourProps } from "antd";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { shallowEqual } from "react-redux";

export default function BankStatementInfoToolbar(refetch) {
  const t = useTranslations();
  const [guidanceTourIsOpen, setGuidanceTourIsOpen] = useState(false);
  const { lang } = useAppSelector((state) => {
    const initPage = state.withPersist.init;
    const lang = state.withPersist.config.lang;
    const pages = state.withPersist.pages;
    return { initPage, lang, pages };
  }, shallowEqual);

  const guidanceTour: TourProps["steps"] = [
    {
      title: t("general.keyboardOperationGuide"),
      description: t("general.thisSectionExplainsKeyboardOperations"),
      target: () => document.getElementById("keyActionHelp"),
    },
    {
      title: t("general.closeButtonGuide"),
      description: t("general.usingThisSectionYouCanCloseThePage"),
      target: () => document.getElementById("closeButton"),
    },
    {
      title: t("general.fullScreenGuide"),
      description: t(
        "general.usingThisSection,youCanViewThePageContentInFullScreen",
      ),
      target: () => document.getElementById("fullScreenMode"),
    },
    {
      title: t("general.guideToFormActions"),
      description: t("general.youCanDoSomeFormActionsUsingThisSection"),
      target: () => document.getElementById("formActions"),
    },
    {
      title: t("general.selectFormType"),
      description: t(
        "general.usingThisSection,youCanSelectAndViewOneOfTheAvailableForms",
      ),
      target: document.getElementById("chooseTypeForm"),
    },
    {
      title: t("general.reportButtonGuide"),
      description: t("general.usingThisSectionYouCanViewTheReportOfThePage"),
      target: () => document.getElementById("reportButton"),
    },
    {
      title: t("general.printButtonGuide"),
      description: t("general.usingThisSectionYouCanPrintThePage"),
      target: () => document.getElementById("printButton"),
    },
    {
      title: t("general.nextRecord"),
      description: t("general.usingThisSectionYouCanViewTheNextRecord"),
      target: () => document.getElementById("nextRecord"),
    },
    {
      title: t("general.previousRecord"),
      description: t("general.usingThisSectionYouCanViewThePreviousRecord"),
      target: () => document.getElementById("previousRecord"),
    },

    {
      title: t("general.updateGuide"),
      description: t("general.usingThisSectionYouCanUpdateTheContentOfThePage"),
      target: () => document.getElementById("reload"),
    },
    {
      title: t("general.help"),
      description: t("general.youCanAddANewItemUsingThisSection"),
      target: () => document.getElementById("newRecord"),
    },
    {
      title: t("general.saveAndNewButtonGuide"),
      description: t(
        "general.usingThisSection,youCanCreateNewContentAndRestoreContent",
      ),
      target: () => document.getElementById("SavePlus"),
    },
  ];

  return (
    <div
      className={`-top-16 absolute flex gap-4 ${
        lang == "fa" ? "-left-3" : "-right-3"
      }`}
    >
      <CustomTooltip title={t("formToolbar.closePage")}>
        <CloseButton />
      </CustomTooltip>

      <CustomTooltip title={t("general.guide")}>
        <CustomButton
          type="text"
          className="bg-gray-gray3 dark:bg-gray-gray11 rounded h-full px-[6px]"
          onClick={() => setGuidanceTourIsOpen(true)}
        >
          <GuidanceIcon />
        </CustomButton>
      </CustomTooltip>

      <CustomTour
        tourStepItems={guidanceTour}
        open={guidanceTourIsOpen}
        onClose={() => setGuidanceTourIsOpen(false)}
      />

      <CustomTooltip
        className="bg-gray-gray3 dark:bg-gray-gray11 rounded h-full"
        title={t("general.fullScreenMode")}
        id="fullScreenMode"
      >
        <ExpandedButton />
      </CustomTooltip>

      <CustomTooltip title={t("general.reload")}>
        <div
          className="flex bg-gray-gray3 dark:bg-gray-gray10 p-[6px] rounded h-full"
          onClick={()=>refetch}
        >
          <Reload
            config={{
              width: 24,
              height: 24,
            }}
          />
        </div>
      </CustomTooltip>
    </div>
  );
}
