import { TourProps } from 'antd';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { CustomTooltip } from '@components/atoms/defaultElements';
import GuidanceButton from '@components/molecules/guidanceButton';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setMinimize as setMinimizeAction } from '@slice/container/index';

import ShortcutsCollapse from '../panelForm/shortcutCollapse';
import BookmarkFilter from './bookmarkFilter';
import Filters from './filters';
import SaveFilter from './saveFilter';
import TagFilters from './tagFilters';

export default function PanelList() {
  const { minimize } = useAppSelector(
    (state) => ({
      minimize: state.withoutPersist.container.minimize,
    }),
    shallowEqual
  );
  const dispatch = useDispatch();
  const setMinimize = () => {
    dispatch(setMinimizeAction(false));
  };
  const t = useTranslations();
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
        "general.usingThisSection,youCanViewThePageContentInFullScreen"
      ),
      target: () => document.getElementById("fullScreenMode"),
    },
    {
      title: t("general.updateGuide"),
      description: t("general.usingThisSectionYouCanUpdateTheContentOfThePage"),
      target: () => document.getElementById("reload"),
    },

    {
      title: t("general.guideToListActions"),
      description: t("general.youCanDoSomeListActionsUsingThisSection"),
      target: () => document.getElementById("listActions"),
    },
    {
      title: t("general.printButtonGuide"),
      description: t("general.usingThisSectionYouCanPrintThePage"),
      target: () => document.getElementById("printButton"),
    },
    {
      title: t("general.reportButtonGuide"),
      description: t("general.usingThisSectionYouCanViewTheReportOfThePage"),
      target: () => document.getElementById("reportButton"),
    },
    {
      title: t("general.listView"),
      description: t("general.usingThisSectionYouCanViewTheListView"),
      target: () => document.getElementById("listView"),
    },
    {
      title: t("general.groupOperationsGuide"),
      description: t("general.usingThisSectionYouCanViewGroupOperations"),
      target: () => document.getElementById("groupAction"),
    },
  ];
  const keyActionHelp = [
    {
      key: "1",
      label: t("general.movingOnRecord"),
      extra: "↑ / ↓",
      className: "bg-white !cursor-help dark:bg-gray-gray10",
    },
    {
      key: "2",
      label: t("general.refresh"),
      extra: "ALT + R",
      className: "bg-white !cursor-help dark:bg-gray-gray10",
    },
    {
      key: "3",
      label: t("general.addNew"),
      extra: "ALT + N",
      className: "bg-white !cursor-help dark:bg-gray-gray10",
    },
    {
      key: "4",
      label: t("general.nextPage"),
      extra: "PAGE UP",
      className: "bg-white !cursor-help dark:bg-gray-gray10",
    },
    {
      key: "5",
      label: t("general.prevPage"),
      extra: "PAGE Down",
      className: "bg-white !cursor-help dark:bg-gray-gray10",
    },
    {
      key: "6",
      label: t("general.goToFormPage"),
      extra: "Enter",
      className: "bg-white !cursor-help dark:bg-gray-gray10",
    },
    {
      key: "7",
      label: t("general.select"),
      extra: "Space",
      className: "bg-white !cursor-help dark:bg-gray-gray10 ",
    },
    {
      key: "8",
      label: t("general.selectAll"),
      extra: "Alt + A",
      className: "bg-white !cursor-help dark:bg-gray-gray10 ",
    },
    {
      key: "14",
      label: t("general.bookmark"),
      extra: "Alt + B",
      className: "bg-white !cursor-help dark:bg-gray-gray10 ",
    },
    {
      key: "15",
      label: t("general.selectedGroupDelete"),
      extra: "Alt + D",
      className: "bg-white !cursor-help dark:bg-gray-gray10 ",
    },
    {
      key: "9",
      label: t("general.deSelectAll"),
      extra: "Esc",
      className: "bg-white !cursor-help dark:bg-gray-gray10 ",
    },
    {
      key: "10",
      label: t("general.fullScreenMode"),
      extra: "Alt + Y",
      className: "bg-white !cursor-help dark:bg-gray-gray10 ",
    },
    {
      key: "11",
      label: t("general.focusOnTable"),
      extra: "Alt + T",
      className: "bg-white !cursor-help dark:bg-gray-gray10 ",
    },
    {
      key: "12",
      label: t("general.searchMenuFocus"),
      extra: "Alt + F",
      className: "bg-white !cursor-help dark:bg-gray-gray10 ",
    },
    {
      key: "13",
      label: t("general.menuFocus"),
      extra: "Alt + M",
      className: "bg-white !cursor-help dark:bg-gray-gray10 ",
    },
  ];
  return (
    <div
      className={` flex flex-col gap-6 w-full  ${
        minimize
          ? " items-center justify-center"
          : "overflow-x-hidden overflow-y-auto hidden-show-scrollBar"
      }`}
    >
      <BookmarkFilter minimize={minimize} />
      <Filters minimize={minimize} setMinimize={setMinimize} />
      <TagFilters minimize={minimize} setMinimize={setMinimize} />
      <SaveFilter minimize={minimize} setMinimize={setMinimize} />
      <CustomTooltip title={t("general.guide")}>
        <GuidanceButton tourStepItems={guidanceTour} minimize={minimize} />
      </CustomTooltip>
      <ShortcutsCollapse
        minimize={minimize}
        setMinimize={setMinimize}
        keyActionHelp={keyActionHelp}
      />
    </div>
  );
}
