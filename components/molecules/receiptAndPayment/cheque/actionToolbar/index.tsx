import { useMemo, useReducer } from "react";

import { MenuProps } from "antd";
import DOMPurify from "dompurify";
import { useTranslations } from "next-intl";
import { shallowEqual, useDispatch } from "react-redux";

import {
  CustomDropdownButton,
  CustomModal,
  CustomTooltip,
} from "@components/atoms/defaultElements";
import {
  BoxMinimalistic,
  Dots,
  DownChevron,
  Info,
  MenuArrowBack,
  MenuSquareIcon,
  Reload,
  RemindMeIcon,
} from "@components/atoms/iconComponents";
import ExpandedButton from "@components/molecules/expandedButton";
import RemindMe from "@components/molecules/remindMe";
import { ActionLabelsEnum } from "@components/organisms/receiptAndPayment/cheque/action/enum";
import { useDarkMode, useInvalidateTag, useNavigatePage } from "@hooks/custom";
import PanelList from "@layout/baseLayout/desktop/actionBar/panelList";
import { useAppSelector } from "@redux/index";
import type { IToolbarMenu } from "@type/toolbar";
import { getColoredIcon, showInfoToast } from "@utils/core";

import CloseButton from "@components/molecules/closeButton";
import { ChequeActionModal } from "../chequeActionModal";
import { ChequeDynamicForm } from "../chequeDynamicForm";
import { chequeDynamicConfig } from "../chequeDynamicForm/config";
import type { Action, IState } from "./type";

export const ActionToolbar = ({
  repoId,
  moreMenu,
  groupMenu,
  selectedItems,
  selectedHeaderId,
  renderGroupAction,
  records,
  rowFieldKey,
  handleRefreshData,
}) => {
  const { mode = "light" } = useDarkMode();

  const dispatch = useDispatch();
  const t = useTranslations();
  const { invalidate } = useInvalidateTag();

  const { activePage, lang, match } = useAppSelector(
    (state) => ({
      lang: state.withPersist.config.lang,
      match: state.withPersist.config.initMatch,
      activePage: state.withPersist.pages.find(
        (item) => item.isActive === true,
      ),
    }),
    shallowEqual,
  );
  const { navigateBack } = useNavigatePage();

  const initialState: IState = {
    actionConfig: null,
    isRemindMeModalOpen: false,
    isChequeDynamicActionOpen: false,
    isPanelModalOpen: false,
  };

  function reducer(state: IState, action: Action): IState {
    switch (action.type) {
      case "OPEN_REMIND_ME_MODAL":
        return {
          ...state,
          isRemindMeModalOpen: true,
          actionConfig: null,
        };

      case "CLOSE_REMIND_ME_MODAL":
        return {
          ...state,
          isRemindMeModalOpen: false,
          actionConfig: null,
        };
      case "OPEN_PANEL_MODAL":
        return {
          ...state,
          isPanelModalOpen: true,
          actionConfig: null,
        };
      case "CLOSE_PANEL_MODAL":
        return {
          ...state,
          isPanelModalOpen: false,
          actionConfig: null,
        };

      case "OPEN_CHEQUE_DYNAMIC_ACTION_MODAL":
        return {
          ...state,
          isChequeDynamicActionOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_CHEQUE_DYNAMIC_ACTION_MODAL":
        return {
          ...state,
          isChequeDynamicActionOpen: false,
          actionConfig: null,
        };

      default:
        return state;
    }
  }

  const [state, dispatchState] = useReducer(reducer, initialState);

  const groupMenuItems = useMemo(() => {
    const handleGroupMenuAction = (action: IToolbarMenu) => {
      try {
        switch (action.MenuDesc) {
          default:
            if (selectedItems && selectedItems.length < 1) {
              showInfoToast(t("toast.minOneItemToast"), action.MenuDesc);
            } else {
              dispatchState({
                type: "OPEN_CHEQUE_DYNAMIC_ACTION_MODAL",
                payload: action,
              });
            }
            break;
        }
      } catch (error) {
        null;
      }
    };

    if (!groupMenu) return [];
    if (!renderGroupAction.render)
      return [
        {
          key: "1",
          icon: <Info />,
          label:
            selectedItems.length > 0 ? (
              <span className="ps-2 text-black-black9 text-xs">
                برای عملیات گروهی باید وضعیت همه چک های انتخابی یکسان باشد !
              </span>
            ) : (
              <span className="ps-2 text-black-black9 text-xs">
                برای عملیات گروهی ابتدا چک های مورد نظر را انتخاب نمایید !
              </span>
            ),
          disabled: true,
        },
      ];

    return groupMenu
      ?.filter((i) => i.condition === renderGroupAction.condition)
      ?.map((menuItem: IToolbarMenu) => {
        const filteredRecords = records.filter((item) =>
          selectedItems.includes(item[rowFieldKey]),
        );
        let isValid = true;
        let errorMessage = "";

        if (menuItem.MenuDesc === ActionLabelsEnum.CustomerReturn) {
          const alternativeValue = filteredRecords.map(
            (item) => item.DocumentCheque.OwnerId,
          );

          if (
            alternativeValue.length &&
            !alternativeValue.every((value) => value === alternativeValue[0])
          ) {
            isValid = false;
            errorMessage = "اشخاص چک های انتخابی باهم یکسان نمی باشد";
          }
        } else if (menuItem.MenuDesc === ActionLabelsEnum.DirectCollect) {
          const alternativeValue = filteredRecords.map(
            (item) => item.CheckReceiptHeader?.CashierId,
          );

          if (
            alternativeValue.length &&
            !alternativeValue.every((value) => value === alternativeValue[0])
          ) {
            isValid = false;
            errorMessage = "صندوق چک های انتخابی باهم یکسان نمی باشد";
          }
        }

        return {
          key: menuItem.MenuId,
          label: menuItem.MenuDesc,
          disabled: !isValid,

          icon: !isValid ? (
            <CustomTooltip title={errorMessage}>
              <Info config={{ stroke: "#000" }} />
            </CustomTooltip>
          ) : (
            <>
              {typeof menuItem.Icon === "string" && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      getColoredIcon(menuItem.Icon, mode),
                    ),
                  }}
                />
              )}
            </>
          ),
          onClick: () => handleGroupMenuAction(menuItem),
        };
      });
  }, [groupMenu, match, selectedItems, records, renderGroupAction]);

  const moreMenuItems = useMemo(() => {
    const remindMeItem = {
      key: t("general.addRemindMe"),
      label: t("general.addRemindMe"),
      icon: (
        <div>
          <RemindMeIcon />
        </div>
      ),
      onClick: () =>
        handleMoreMenuAction({
          key: t("general.addRemindMe"),
          MenuDesc: t("general.addRemindMe"),
          loggedInUserId: null,
        }),
    };
    const handleMoreMenuAction = (action: IToolbarMenu) => {
      try {
        switch (action.MenuDesc) {
          case ActionLabelsEnum.RemindMe:
            if (selectedItems && selectedItems.length === 1) {
              dispatchState({
                type: "OPEN_REMIND_ME_MODAL",
                payload: action,
              });
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
    if (moreMenu) return [remindMeItem];
    const items = moreMenu.map((menuItem: IToolbarMenu) => ({
      key: menuItem.MenuId,
      label: menuItem.MenuDesc,
      icon: (
        <>
          {typeof menuItem.Icon === "string" ? (
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(getColoredIcon(menuItem.Icon, mode)),
              }}
            />
          ) : (
            menuItem.Icon
          )}
        </>
      ),
      onClick: () => handleMoreMenuAction(menuItem),
    }));
    return [...items, remindMeItem];
  }, [selectedItems, t, moreMenu]);

  const mobileMoreMenuItems: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <div className="flex justify-between w-full">
          <span className="flex justify-end gap-x-2 text-gray-gray10 text-sm">
            <BoxMinimalistic />
            {t("general.show")}
          </span>
          <DownChevron />
        </div>
      ),
      type: "group",

      children: null,
    },
    {
      type: "divider",
    },
    {
      key: "2",
      type: "group",
      children: moreMenuItems,
    },
    {
      type: "divider",
    },
    {
      key: "3",
      label: (
        <div className="flex justify-between w-full">
          <span className="flex justify-end gap-x-2 text-gray-gray10 text-sm">
            <BoxMinimalistic />
            {t("general.groupAction")}
          </span>
          <DownChevron />
        </div>
      ),
      type: "group",
      children: groupMenuItems,
    },
  ];

  const pageTitle = activePage?.caption;

  return (
    <>
      <div
        className={`${
          match ? "justify-end" : "justify-between"
        } flex items-center gap-2  w-full h-full`}
      >
        {match ? (
          <div className="flex gap-2">
            <CustomTooltip title={t("formToolbar.closePage")}>
              <CloseButton />
            </CustomTooltip>
            <CustomTooltip title={t("general.fullScreenMode")}>
              <ExpandedButton />
            </CustomTooltip>
            <CustomTooltip title={t("general.reload")}>
              <div
                className="flex bg-gray-gray3 dark:bg-gray-gray10 p-[6px] rounded h-full"
                onClick={handleRefreshData}
              >
                <Reload
                  config={{
                    width: 24,
                    height: 24,
                  }}
                />
              </div>
            </CustomTooltip>

            <CustomDropdownButton
              placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
              className="flex bg-gray-gray3 dark:bg-gray-gray10 p-[6px] rounded h-full"
              items={moreMenuItems}
            >
              <span className="cursor-pointer">
                <Dots />
              </span>
            </CustomDropdownButton>
            <CustomDropdownButton
              placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
              className="flex justify-between items-center bg-gray-gray3 dark:bg-gray-gray10 p-[6px] rounded w-28 h-full hover:text-main-black text-xs"
              items={[]}
            >
              <span className="cursor-pointer">
                لیست اصلی <DownChevron />
              </span>
            </CustomDropdownButton>

            <CustomDropdownButton
              placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
              className="flex justify-between items-center bg-gray-gray3 dark:bg-gray-gray10 p-[6px] rounded w-28 h-full hover:text-main-black text-xs"
              items={groupMenuItems}
            >
              <span className="cursor-pointer">
                {t("general.groupAction")} <DownChevron />
              </span>
            </CustomDropdownButton>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mt-2">
              <div
                className={`${
                  lang !== "fa" ? "rotate-180" : ""
                } flex bg-white dark:bg-gray-gray12 p-[6px] rounded h-full `}
                onClick={navigateBack}
              >
                <MenuArrowBack
                  config={{
                    width: 24,
                    height: 24,
                  }}
                />
              </div>
              <span className="text-xs">{t(`${pageTitle}`)}</span>
            </div>
            <div className="flex gap-2">
              <div
                className="flex bg-white dark:bg-gray-gray12 p-[6px] rounded h-full"
                onClick={() =>
                  dispatchState({ type: "OPEN_PANEL_MODAL", payload: null })
                }
              >
                <MenuSquareIcon
                  config={{
                    width: 24,
                    height: 24,
                  }}
                />
              </div>
              <CustomDropdownButton
                placement={lang === "fa" ? "bottomRight" : "bottomLeft"}
                className="flex bg-white dark:bg-gray-gray12 p-[6px] rounded h-full"
                items={mobileMoreMenuItems}
              >
                <span className="cursor-pointer">
                  <Dots />
                </span>
              </CustomDropdownButton>
            </div>
          </>
        )}
      </div>

      {state.isRemindMeModalOpen && selectedItems?.length === 1 && (
        <CustomModal
          contentClassName={`${match ? "w-[520px]" : ""}`}
          headerName={t("general.reminder")}
          headerIcon={
            match && (
              <>
                {typeof state.actionConfig.Icon === "string" && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )}
              </>
            )
          }
          closeModal={() => dispatchState({ type: "CLOSE_REMIND_ME_MODAL" })}
          isModalOpen={state.isRemindMeModalOpen}
          content={
            <RemindMe
              repoId={repoId}
              refId={selectedItems[0]}
              onClose={() => dispatchState({ type: "CLOSE_REMIND_ME_MODAL" })}
              isOpen={state.isRemindMeModalOpen}
            />
          }
        />
      )}
      {state.isPanelModalOpen && (
        <CustomModal
          contentClassName={`${match ? "w-[520px]" : ""}`}
          headerName={t("sidebar.listPanel")}
          closeModal={() => dispatchState({ type: "CLOSE_PANEL_MODAL" })}
          isModalOpen={state.isPanelModalOpen}
          content={<PanelList />}
        />
      )}

      {state.isChequeDynamicActionOpen && selectedItems?.length > 0 && (
        <CustomModal
          contentClassName={`${match ? "w-[700px] h-[470px]" : ""}`}
          headerName={state.actionConfig.MenuDesc}
          headerIcon={
            match && (
              <>
                {typeof state.actionConfig.Icon === "string" && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getColoredIcon(state.actionConfig.Icon, mode),
                    }}
                    style={{ width: "18px", height: "17px" }}
                  />
                )}
              </>
            )
          }
          headerDescription="عملیات گروهی"
          closeModal={() =>
            dispatchState({ type: "CLOSE_CHEQUE_DYNAMIC_ACTION_MODAL" })
          }
          isModalOpen={state.isChequeDynamicActionOpen}
          content={
            <ChequeActionModal ids={selectedHeaderId}>
              <ChequeDynamicForm
                handleClose={() =>
                  dispatchState({ type: "CLOSE_CHEQUE_DYNAMIC_ACTION_MODAL" })
                }
                sourceId={selectedItems.map((item, index) => {
                  return {
                    DocumentChequeId: item,
                    RowNum: index + 1,
                  };
                })}
                selectedRecords={selectedItems.map((selectedId) => {
                  const selectedRecord = records?.find(
                    (el) => el[rowFieldKey] === selectedId,
                  );
                  return selectedRecord;
                })}
                sourceKey={"Details"}
                config={
                  chequeDynamicConfig.find(
                    (item) => item.name === state?.actionConfig?.MenuDesc,
                  )?.config
                }
              />
            </ChequeActionModal>
          }
        />
      )}
    </>
  );
};
