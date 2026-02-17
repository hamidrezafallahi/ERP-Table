import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Drawer,
  Menu,
  MenuProps,
} from 'antd';
import DOMPurify from 'dompurify';
import { useTranslations } from 'next-intl';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  CustomButton,
  CustomDropdownButton,
  CustomModal,
  CustomSwitch,
  CustomTooltip,
} from '@components/atoms/defaultElements';
import { CustomDrawer } from '@components/atoms/defaultElements/drawer';
import {
  BoxMinimalistic,
  Close,
  Dots,
  DownChevron,
  GroupActionIcon,
  ListIcon,
  MenuArrowBack,
  New,
  Printer,
  Reload,
  RemindMeIcon,
  ReportIcon,
  TagIcon,
} from '@components/atoms/iconComponents';
import CloseButton from '@components/molecules/closeButton';
import Confirmation from '@components/molecules/confirmation';
import ExpandedButton from '@components/molecules/expandedButton';
import Notification from '@components/molecules/notification';
import { QuickSearch } from '@components/molecules/quickSearch';
import { QuickFilterRef } from '@components/molecules/quickSearch/type';
import RemindMe from '@components/molecules/remindMe';
import { TagManagement } from '@components/molecules/tag';
import {
  useDarkMode,
  useInitializePage,
  useInvalidateTag,
  useNavigatePage,
} from '@hooks/custom';
import { useAppSelector } from '@redux/index';
import { useCUDDataMutation } from '@services/base';
import { ReportTypeEnum } from '@services/mng/report/type';
import { clearReportData } from '@slice/config';
import { addHistory } from '@slice/history';
import { HistoryTypeEnum } from '@slice/history/enum';
import {
  resetItemsByPage,
  setItems,
} from '@slice/items';
import {
  setPageState,
  setPageType,
  setShowTags,
  setViewData,
} from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import type {
  IReportPosition,
  IToolbarList,
  IToolbarMenu,
} from '@type/toolbar';
import {
  getColoredIcon,
  showInfoToast,
  showSuccessToast,
} from '@utils/core';

import ChatWidget from '../chat';
import { ActionLabelsEnum } from '../list/enum';
import {
  ShowPrinter,
  ShowReport,
} from '../managementSystem';
import ListSelectMode from './listSelectMode';

export default function ListToolbar({
  formUrl,
  addCaption,
  deleteUrl,
  confirmUrl,
  toolbarData,
  repoId,
  systemId,
  isSelectMode,
  rowFieldKey,
  staticKey,
  staticKeyII,
  gridData,
  url,
  renderCustomActions,
}) {
  const { mode = "light" } = useDarkMode();

  const dispatch = useDispatch();
  const t = useTranslations();
  const { invalidate } = useInvalidateTag();
  const initializePage = useInitializePage();
  const { selectedItems, activePage, lang, match, data, userId } =
    useAppSelector(
      (state) => ({
        lang: state.withPersist.config.lang,
        selectedItems: state.withPersist.listItems,
        data: state.withPersist.init?.data,
        activePage: state.withPersist.pages.find(
          (item) => item.isActive === true,
        ),
        match: state.withPersist.config.initMatch,
        userId: state.withPersist.config.userSession.UserInfo.UserId,
      }),
      shallowEqual,
    );

  const quickFilterRef = useRef<QuickFilterRef>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const { navigateBack } = useNavigatePage();
  const [confirmationItem, { isLoading: confirmationIsLoading }] =
    useCUDDataMutation();

  const [listName, setListName] = useState(t("general.showList"));
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmDrawerOpen, setIsConfirmDrawerOpen] = useState(false);
  const [isRemindMeModalOpen, setIsRemindMeModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [printId, setPrintId] = useState(null);
  const [isAddTagModalOpen, setIsAddTagModalOpen] = useState(false);
  // const [isPanelModalOpen, setIsPanelModalOpen] = useState(false);
  const [isMobileMenuDrawerOpen, setIsMobileMenuDrawerOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"Delete" | "Confirm">(
    "Delete",
  );
  const displayListItems = useMemo(() => {
    if (!toolbarData?.List?.ListProp) return [];

    const handleChangeList = (listItem: IToolbarList) => {
      setListName(listItem.Desc);
      dispatch(
        setViewData({
          ...activePage.viewData,
          RepoViewId: listItem.Id,
        }),
      );

      if (activePage?.type !== listItem?.Type) {
        dispatch(setPageType(listItem?.Type));
      }
    };

    return toolbarData.List.ListProp.map((listItem: IToolbarList) => ({
      key: listItem.Id,
      value: listItem.Id,
      className:
        activePage?.viewData?.RepoViewId === listItem.Id
          ? "!bg-gray-gray4 dark:!bg-gray-gray95"
          : "",
      label: match ? (
        <span>{listItem.Desc}</span>
      ) : activePage?.viewData?.RepoViewId === listItem.Id ? (
        <span>✔ {listItem.Desc}</span>
      ) : (
        <span>{listItem.Desc}</span>
      ),
      icon: listItem.icon ? (
        <span
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(getColoredIcon(listItem.icon, mode)),
          }}
        />
      ) : null,
      onClick: () => handleChangeList(listItem),
    }));
  }, [
    dispatch,
    toolbarData,
    activePage?.viewData?.RepoViewId,
    activePage?.type,
    mode,
  ]);

  const reportItems = useMemo(() => {
    const handleChangeReport = (report: IReportPosition) => {
      setReportId(report?.ReportId);

      setIsReportModalOpen(true);
    };

    const correctReportItems = toolbarData?.ReportPosition?.filter(
      (item: IReportPosition) =>
        item.RepoViewId === activePage?.viewData?.RepoViewId &&
        item.Type !== ReportTypeEnum.Print,
    );

    if (!correctReportItems || toolbarData === undefined) {
      return [];
    } else {
      return correctReportItems?.map((reportItem: IReportPosition) => ({
        key: reportItem.Id,
        label: reportItem.RepoViewName,

        onClick: () => handleChangeReport(reportItem),
      }));
    }
  }, [dispatch, toolbarData?.ReportPosition, activePage?.viewData?.RepoViewId]);

  const printItems = useMemo(() => {
    const handleChangePrint = (print: IReportPosition) => {
      if (
        selectedItems &&
        selectedItems.itemsByPage?.[activePage?.pageId] &&
        selectedItems.itemsByPage?.[activePage?.pageId]?.length > 0
      ) {
        setIsPrintModalOpen(true);
        setPrintId(print?.ReportId);
      } else {
        showInfoToast(
          t("toast.minOneItemToast"),
          ActionLabelsEnum.Print as string,
        );
      }
    };

    const correctPrintItems = toolbarData?.ReportPosition?.filter(
      (item: IReportPosition) =>
        item.RepoViewId === activePage?.viewData?.RepoViewId &&
        item.Type === ReportTypeEnum.Print,
    );

    if (!correctPrintItems || toolbarData === undefined) {
      return [];
    } else {
      return correctPrintItems?.map((printItem: IReportPosition) => ({
        key: printItem.Id,
        label: printItem.RepoViewName,

        onClick: () => handleChangePrint(printItem),
      }));
    }
  }, [
    dispatch,
    toolbarData?.ReportPosition,
    activePage?.viewData?.RepoViewId,
    selectedItems.itemsByPage?.[activePage?.pageId],
  ]);

  const groupMenuItems = useMemo(() => {
    const handleGroupMenuAction = (menuItem: IToolbarMenu) => {
      try {
        switch (menuItem.MenuDesc) {
          case ActionLabelsEnum.Delete as string:
            if (
              selectedItems &&
              selectedItems.itemsByPage?.[activePage?.pageId] &&
              selectedItems.itemsByPage?.[activePage?.pageId]?.length > 0
            ) {
              setConfirmMode("Delete");
              if (match) {
                setIsConfirmModalOpen(true);
              } else {
                setIsConfirmDrawerOpen(true);
              }
            } else {
              showInfoToast(
                t("toast.minOneItemToast"),
                ActionLabelsEnum.Delete as string,
              );
            }
            break;
          case ActionLabelsEnum.Confirm1 as string:
          case ActionLabelsEnum.Confirm2 as string:
            if (
              selectedItems &&
              selectedItems.itemsByPage?.[activePage?.pageId] &&
              selectedItems.itemsByPage?.[activePage?.pageId]?.length > 0
            ) {
              setConfirmMode("Confirm");
              if (match) {
                setIsConfirmModalOpen(true);
              } else {
                setIsConfirmDrawerOpen(true);
              }
            } else {
              showInfoToast(t("toast.minOneItemToast"));
            }
            break;
          case ActionLabelsEnum.AddTag as string:
            if (
              selectedItems &&
              selectedItems.itemsByPage?.[activePage?.pageId] &&
              selectedItems.itemsByPage?.[activePage?.pageId]?.length > 0
            ) {
              setIsAddTagModalOpen(true);
            } else {
              showInfoToast(
                t("toast.minOneItemToast"),
                ActionLabelsEnum.AddTag as string,
              );
            }
            break;

          default:
            null;
            break;
        }
      } catch (error) {
        null;
      }
    };

    if (!toolbarData?.GroupMenu) return [];

    return toolbarData.GroupMenu.map((menuItem: IToolbarMenu) => {
      return {
        key: menuItem.MenuId,
        label: menuItem.MenuDesc,
        icon: (
          <span
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(getColoredIcon(menuItem.Icon, mode)),
            }}
          />
        ),
        onClick: () => handleGroupMenuAction(menuItem),
      };
    });
  }, [
    toolbarData?.GroupMenu,
    match,
    selectedItems,
    mode,
    toolbarData?.ReportPosition,
    toolbarData,
  ]);

  const moreMenuItems = useMemo(() => {
    const remindMeItem = {
      key: t("general.addRemindMe"),
      label: t("general.addRemindMe"),
      icon: match && (
        <span className="flex justify-start items-center">
          <RemindMeIcon
            config={{
              width: 24,
              height: 24,
              strokeWidth: 0.8,
            }}
          />
        </span>
      ),
      onClick: () =>
        handleMoreMenuAction({
          key: t("general.addRemindMe"),
          MenuDesc: t("general.addRemindMe"),
          loggedInUserId: null,
        }),
    };
    const handleMoreMenuAction = (menuItem: IToolbarMenu) => {
      try {
        switch (menuItem.MenuDesc) {
          case ActionLabelsEnum.RemindMe:
            if (
              selectedItems &&
              selectedItems.itemsByPage?.[activePage?.pageId] &&
              selectedItems.itemsByPage?.[activePage?.pageId]?.length === 1
            ) {
              setIsRemindMeModalOpen(true);
            } else {
              showInfoToast(
                t("toast.remindMeToast"),
                ActionLabelsEnum.RemindMe as string,
              );
            }
            break;

          default:
            null;
            break;
        }
      } catch (error) {
        null;
      }
    };
    if (!toolbarData?.MoreMenu) return [remindMeItem];
    const items = toolbarData.MoreMenu.map((menuItem: IToolbarMenu) => ({
      key: menuItem.MenuId,
      label: menuItem.MenuDesc,
      icon: (
        <span
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(getColoredIcon(menuItem.Icon, mode)),
          }}
        />
      ),
      onClick: () => handleMoreMenuAction(menuItem),
    }));
    return [...items, remindMeItem];
  }, [selectedItems, t, toolbarData?.MoreMenu]);

  const handleShowTag = () => {
    dispatch(setShowTags({}));
  };

  const mobileMoreMenuItems: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <span className="flex gap-x-2 text-gray-gray10 dark:text-white text-sm">
          <BoxMinimalistic />
          {t("general.show")}
        </span>
      ),

      type: "group",
      children: displayListItems,
    },
    {
      key: "2",
      label: (
        <span className="flex gap-x-2 text-gray-gray10 dark:text-white text-sm">
          <ReportIcon />
          {t("general.reports")}
        </span>
      ),

      type: "group",
      children: reportItems,
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: (
        <span className="flex gap-x-2 text-gray-gray10 dark:text-white text-sm">
          <BoxMinimalistic />
          {t("general.moreAction")}
        </span>
      ),
      type: "group",
      children: moreMenuItems,
    },
    {
      type: "divider",
    },
    {
      key: "4",
      type: "group",
      label: (
        <div className="flex flex-col items-start gap-2">
          <span>
            <>{t("sidebar.showTags")}</>
          </span>
          <CustomSwitch
            defaultChecked={activePage?.viewData?.ShowTags}
            onChange={handleShowTag}
          />
        </div>
      ),
    },
  ];

  const handleAddNew = () => {
    initializePage({
      config: {
        RepoId: repoId,
        SystemId: systemId,
        url: formUrl,
        data: data,
        returnPageId:activePage.pageId
      },
    });
  };

  const correctItem = gridData?.Data?.find(
    (item) =>
      item[rowFieldKey] ===
      selectedItems?.itemsByPage?.[activePage?.pageId]?.[0],
  );
  const nameI = correctItem?.[staticKey];
  const nameII = staticKeyII ? ` - ${correctItem?.[staticKeyII]}` : "";
  const name = `${nameI} ${nameII}`;

  const handleClearSearchPhrase = (e) => {
    e.preventDefault();
    e.stopPropagation();
    quickFilterRef.current?.clearInput();
    setIsSearchFocused(false);
  };

  function transformKey(key: string): string {
    return key.replace(/List$/, "");
  }

  const handleConfirmation = async () => {
    const isArray = Array.isArray(
      selectedItems?.itemsByPage?.[activePage?.pageId],
    );
    const idsToConfirm =
      isArray && selectedItems?.itemsByPage?.[activePage?.pageId]?.length > 1
        ? selectedItems.itemsByPage?.[activePage?.pageId]
        : [selectedItems?.itemsByPage?.[activePage?.pageId]?.[0]];
    const pageName = transformKey(activePage?.caption);

    try {
      const confirmationResult = await confirmationItem({
        url: confirmMode === "Delete" ? deleteUrl : confirmUrl,
        body: { Ids: idsToConfirm },
      }).unwrap();

      if (confirmMode === "Delete") {
        if (
          confirmationResult.DeleteResults.every(
            (result) => result.IsDelete === true,
          )
        ) {
          dispatch(
            addHistory({
              key: Math.random(),
              initConfig: null,
              type: HistoryTypeEnum.Delete,
              pageName: pageName,
              name:
                selectedItems?.itemsByPage?.[activePage?.pageId]?.length > 1
                  ? t("general.groupDelete")
                  : name,
              pageIcon: activePage?.icon,
            }),
          );

          showSuccessToast(t("toast.successTitle"));
          dispatch(resetItemsByPage({ pageId: activePage?.pageId }));

          if (isConfirmDrawerOpen) {
            setIsConfirmDrawerOpen(false);
          }
          if (isConfirmModalOpen) {
            setIsConfirmModalOpen(false);
          }
          dispatch(
            setPageState({
              ...activePage,
              pageState: PageStateEnum.NeedReload,
            }),
          );
        } else {
          const failedItems = confirmationResult.DeleteResults.map((item) => {
            if (item.IsDelete === true) {
              dispatch(
                setPageState({
                  ...activePage,
                  pageState: PageStateEnum.NeedReload,
                }),
              );
            }
            return item.IsDelete === false ? item.Key : null;
          });
          dispatch(
            addHistory({
              key: Math.random(),
              initConfig: null,
              type: HistoryTypeEnum.Delete,
              pageName: pageName,
              name:
                selectedItems?.itemsByPage?.[activePage?.pageId]?.length > 1
                  ? t("general.groupDelete")
                  : name,
              pageIcon: activePage?.icon,
            }),
          );
          dispatch(
            setItems({ pageId: activePage?.pageId, items: failedItems }),
          );
          if (isConfirmDrawerOpen) {
            setIsConfirmDrawerOpen(false);
          }
          if (isConfirmModalOpen) {
            setIsConfirmModalOpen(false);
          }
        }
      } else {
        if (confirmationResult?.Result === "Success") {
          showSuccessToast(t("toast.successTitle"));
          dispatch(resetItemsByPage({ pageId: activePage?.pageId }));

          if (isConfirmDrawerOpen) {
            setIsConfirmDrawerOpen(false);
          }
          if (isConfirmModalOpen) {
            setIsConfirmModalOpen(false);
          }
          dispatch(
            setPageState({
              ...activePage,
              pageState: PageStateEnum.NeedReload,
            }),
          );
        }
        if (isConfirmDrawerOpen) {
          setIsConfirmDrawerOpen(false);
        }
        if (isConfirmModalOpen) {
          setIsConfirmModalOpen(false);
        }
      }
    } catch (error) {
      null;
    }
  };

  const handleRefreshData = () => {
    invalidate(activePage?.viewData?.url);

    dispatch(
      setPageState({
        ...activePage,
        pageState: PageStateEnum.Opened,
      }),
    );
    dispatch(
      setViewData({
        ...activePage?.viewData,
        deletedItems: [],
        statusItems: [],
        PagingInfo: {
          PageNumber: 1,
          PageRecordCount: activePage?.viewData?.PagingInfo?.PageRecordCount,
        },
      }),
    );
  };

  const pageTitle = activePage.caption;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        // e.preventDefault();
        if (e.key === "r") {
          handleRefreshData();
        }
        if (e.key === "d") {
          if (
            selectedItems &&
            selectedItems.itemsByPage?.[activePage?.pageId] &&
            selectedItems.itemsByPage?.[activePage?.pageId]?.length > 0
          ) {
            setConfirmMode("Delete");
            if (match) {
              setIsConfirmModalOpen(true);
            } else {
              setIsConfirmDrawerOpen(true);
            }
          } else {
            showInfoToast(
              t("toast.minOneItemToast"),
              ActionLabelsEnum.Delete as string,
            );
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (
      toolbarData?.List?.ListProp?.length &&
      listName === t("general.showList")
    ) {
      setListName(toolbarData.List.ListProp[0].Desc);
    }
  }, [toolbarData, listName, t]);

  return (
    <>
      {!match && (
        <div className="top-0 right-0 left-0 z-0 absolute shadow-gray-gray3 shadow-sm w-full !h-[50px]"></div>
      )}
      <div
        className={`${
          match ? "justify-end" : "justify-between"
        } flex items-center gap-2 w-full h-full pb-4`}
      >
        {toolbarData &&
          (match ? (
            <div className="flex gap-2">
              <CustomTooltip title={t("formToolbar.closePage")}>
                <CloseButton />
              </CustomTooltip>
              <CustomTooltip
                className="flex bg-gray-gray3 dark:!bg-gray-gray11 rounded h-full"
                title={t("general.fullScreenMode")}
                id="fullScreenMode"
              >
                <ExpandedButton />
              </CustomTooltip>

              <CustomTooltip
                className="flex bg-gray-gray3 dark:!bg-gray-gray11 rounded h-full"
                title={t("general.reload")}
              >
                <div
                  className="flex bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded h-full cursor-pointer"
                  onClick={handleRefreshData}
                  id="reload"
                >
                  <Reload
                    config={{
                      width: 24,
                      height: 24,
                    }}
                  />
                </div>
              </CustomTooltip>

              {moreMenuItems.length > 0 && (
                <CustomDropdownButton
                  placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
                  className="flex bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded h-full"
                  items={moreMenuItems}
                >
                  <span className="cursor-pointer" id="listActions">
                    <Dots />
                  </span>
                </CustomDropdownButton>
              )}
              {printItems.length > 0 && (
                <CustomDropdownButton
                  placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
                  className="flex justify-center xxl:justify-between items-center bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded w-9 h-9 hover:text-main-black dark:hover:text-white text-xs"
                  items={printItems}
                  popupRender={(originalMenu) => {
                    if (printItems.length === 1) return <></>;
                    return <>{originalMenu}</>;
                  }}
                >
                  <div
                    className="cursor-pointer"
                    id="printButton"
                    onClick={() =>
                      printItems?.length === 1 && printItems?.[0]?.onClick()
                    }
                  >
                    <CustomTooltip title={t("general.print")}>
                      <Printer />
                    </CustomTooltip>
                  </div>
                </CustomDropdownButton>
              )}
              {reportItems.length > 0 && (
                <CustomDropdownButton
                  placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
                  className="flex justify-center xxl:justify-between items-center bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded w-9 h-9 hover:text-main-black dark:hover:text-white text-xs"
                  items={reportItems}
                  popupRender={(originalMenu) => {
                    if (reportItems.length === 1) return <></>;
                    return <>{originalMenu}</>;
                  }}
                >
                  <div
                    className="cursor-pointer"
                    id="reportButton"
                    onClick={() =>
                      reportItems?.length === 1 && reportItems?.[0]?.onClick()
                    }
                  >
                    <CustomTooltip title={t("general.report")}>
                      <ReportIcon />
                    </CustomTooltip>
                  </div>
                </CustomDropdownButton>
              )}
              {displayListItems.length > 1 && (
                <CustomDropdownButton
                  placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
                  className="flex justify-center xxl:justify-between items-center bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded w-9 xxl:w-fit h-9 hover:text-main-black dark:hover:text-white text-xs"
                  items={displayListItems}
                >
                  <div
                    className="grid grid-cols-3 cursor-pointer"
                    id="listView"
                  >
                    <div className="hidden xxl:block col-span-2 w-full truncate text-ellipsis text-nowrap">
                      <CustomTooltip title={listName}>{listName}</CustomTooltip>
                    </div>

                    <div className="hidden xxl:block">
                      <DownChevron />
                    </div>
                    <div className="xxl:hidden block col-span-3">
                      <ListIcon />
                    </div>
                  </div>
                </CustomDropdownButton>
              )}

              {groupMenuItems.length > 0 && (
                <CustomDropdownButton
                  placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
                  className="flex justify-center xxl:justify-between items-center bg-gray-gray3 dark:!bg-gray-gray11 p-[6px] rounded w-9 xxl:w-fit h-9 hover:text-main-black dark:hover:text-white text-xs"
                  items={groupMenuItems}
                >
                  <div className="cursor-pointer" id="groupAction">
                    <div className="hidden xxl:flex justify-between items-center w-full">
                      {t("general.groupAction")} <DownChevron />
                    </div>
                    <div className="xxl:hidden block">
                      <GroupActionIcon />
                    </div>
                  </div>
                </CustomDropdownButton>
              )}
            </div>
          ) : (
            <div
              className={`${
                isSearchFocused ? "" : "justify-between gap-2"
              } flex items-center mt-2 w-full z-10`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`${
                    lang !== "fa" ? "rotate-180" : ""
                  } z-10 flex bg-white dark:bg-gray-gray11 pt-1 rounded h-full`}
                  onClick={navigateBack}
                >
                  <MenuArrowBack
                    config={{
                      width: 24,
                      height: 24,
                    }}
                  />
                </div>
                {!isSearchFocused && (
                  <span className="text-sm">{t(`${pageTitle}`)}</span>
                )}
              </div>
              <div
                className={`${
                  isSearchFocused ? "w-full" : ""
                } flex items-center`}
              >
                <div
                  className={`${
                    isSearchFocused ? "flex-1" : "flex gap-3"
                  } flex items-center`}
                >
                  {!isSearchFocused && !!userId && <ChatWidget />}
                  {!isSearchFocused && <Notification />}
                  <div
                    className={`transition-all rounded duration-500 ${
                      !match && !isSearchFocused ? "max-w-[26px]" : "w-full"
                    }`}
                  >
                    <QuickSearch
                      ref={quickFilterRef}
                      onFocus={() => setIsSearchFocused(true)}
                      isActive={isSearchFocused}
                    />
                  </div>
                </div>
                {!isSearchFocused && (
                  <div
                    className="flex justify-end items-center"
                    onClick={() => setIsMobileMenuDrawerOpen(true)}
                  >
                    <span className="w-4">
                      <Dots
                        config={{
                          stroke: "#585858",
                        }}
                      />
                    </span>
                  </div>
                )}
                {isSearchFocused && (
                  <div
                    onClick={(e) => handleClearSearchPhrase(e)}
                    className="flex justify-end p-[6px]"
                  >
                    <Close
                      config={{
                        width: 18,
                        height: 18,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        {formUrl && match && (
          <CustomButton
            type="text"
            className={`${
              match ? "rounded" : "rounded-full"
            } flex justify-center items-center dark:bg-white dark:text-main-black bg-black-black8 !hover:bg-white p-[6px] border hover:border-black-black8   h-full text-white hover:text-black-black9 text-xs`}
            onClick={handleAddNew}
          >
            <New
              inheritStyle
              config={{
                width: 20,
                height: 20,
              }}
            />
            <div className="hidden xxl:block">{match && addCaption}</div>
          </CustomButton>
        )}
        {renderCustomActions && renderCustomActions()}
      </div>

      {isConfirmModalOpen &&
        selectedItems?.itemsByPage?.[activePage?.pageId]?.length > 0 && (
          <CustomModal
            width={300}
            centered
            disableTitle
            closeModal={() => setIsConfirmModalOpen(false)}
            isModalOpen={isConfirmModalOpen}
            content={
              <Confirmation
                itemsToConfirm={
                  selectedItems?.itemsByPage?.[activePage?.pageId] ?? []
                }
                mode={confirmMode}
                onLoading={confirmationIsLoading}
                onCancel={() => setIsConfirmModalOpen(false)}
                onConfirm={handleConfirmation}
              />
            }
          />
        )}

      <CustomDrawer
        isOpen={isConfirmDrawerOpen}
        onClose={() => setIsConfirmDrawerOpen(false)}
        content={
          <Confirmation
            itemsToConfirm={
              selectedItems?.itemsByPage?.[activePage?.pageId] ?? []
            }
            mode={confirmMode}
            onLoading={confirmationIsLoading}
            onCancel={() => setIsConfirmDrawerOpen(false)}
            onConfirm={handleConfirmation}
          />
        }
      />

      {isRemindMeModalOpen && (
        <CustomModal
          contentClassName={`${match ? "w-[520px]" : ""}`}
          headerIcon={<RemindMeIcon />}
          headerName={t("general.reminder")}
          closeModal={() => setIsRemindMeModalOpen(false)}
          isModalOpen={isRemindMeModalOpen}
          content={
            <RemindMe
              isOpen={isRemindMeModalOpen}
              repoId={repoId}
              refId={selectedItems?.itemsByPage?.[activePage?.pageId]?.[0]}
              onClose={() => setIsRemindMeModalOpen(false)}
            />
          }
        />
      )}
      {/* {isPanelModalOpen && (
        <CustomModal
          contentClassName={`${match ? "w-[520px]" : ""}`}
          headerName={t("sidebar.listPanel")}
          closeModal={() => setIsPanelModalOpen(false)}
          isModalOpen={isPanelModalOpen}
          content={<PanelList />}
        />
      )} */}

      {isAddTagModalOpen && (
        <CustomModal
          contentClassName={`${match ? "w-[520px]" : ""}`}
          headerName={t("modal.tags")}
          headerIcon={<TagIcon />}
          closeModal={() => setIsAddTagModalOpen(false)}
          isModalOpen={isAddTagModalOpen}
          content={
            <div className="p-2">
              <TagManagement
                refIds={selectedItems?.itemsByPage?.[activePage?.pageId] ?? []}
              />
            </div>
          }
        />
      )}
      {isReportModalOpen && (
        <CustomModal
          withFullscreen
          contentClassName={`${match ? "min-w-[950px] " : ""}  overflow-hidden`}
          headerIcon={<ReportIcon />}
          headerName={t("general.report")}
          closeModal={() => {
            dispatch(clearReportData(null));
            setIsReportModalOpen(false);
          }}
          isModalOpen={isReportModalOpen}
          content={<ShowReport url={url} reportId={reportId} />}
        />
      )}

      {isPrintModalOpen && (
        <CustomModal
          withFullscreen
          contentClassName={`${match ? "min-w-[800px] " : ""}  overflow-hidden`}
          headerIcon={<Printer />}
          headerName={t("general.print")}
          closeModal={() => {
            setIsPrintModalOpen(false);
          }}
          isModalOpen={isPrintModalOpen}
          content={
            <ShowPrinter
              printId={printId}
              ids={selectedItems?.itemsByPage?.[activePage?.pageId] ?? []}
            />
          }
        />
      )}

      <Drawer
        width="70%"
        placement={lang === "fa" ? "right" : "left"}
        closable={false}
        onClose={() => setIsMobileMenuDrawerOpen(false)}
        open={isMobileMenuDrawerOpen}
      >
        <Menu
          onClick={() => setIsMobileMenuDrawerOpen(false)}
          style={{ width: "100%", border: "none" }}
          defaultSelectedKeys={["1"]}
          defaultOpenKeys={["sub1"]}
          mode="inline"
          items={mobileMoreMenuItems}
        />
      </Drawer>

      <ListSelectMode
        confirmationIsLoading={confirmationIsLoading}
        handleConfirmation={handleConfirmation}
        selectedItems={selectedItems?.itemsByPage?.[activePage?.pageId] ?? []}
        toolbarData={toolbarData}
        isSelectMode={isSelectMode}
      />
    </>
  );
}
