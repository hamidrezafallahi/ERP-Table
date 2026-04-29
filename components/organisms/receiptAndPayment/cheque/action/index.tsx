"use client";
import { useReducer, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import { shallowEqual } from "react-redux";

import { CustomModal } from "@components/atoms/defaultElements";
import Confirmation from "@components/molecules/confirmation";
import {
  ActionGrid,
  ActionGridToolbar,
  ActionToolbar,
  ChequeActionModal,
  ChequeCirculationModal,
  ChequeDynamicForm,
  ChequeInfoModal,
} from "@components/molecules/receiptAndPayment/cheque";
import ActionCard from "@components/molecules/receiptAndPayment/cheque/actionCard";
import { chequeDynamicConfig } from "@components/molecules/receiptAndPayment/cheque/chequeDynamicForm/config";
import { useDarkMode, useInitializePage } from "@hooks/custom";
import { useAppSelector } from "@redux/index";
import { useCUDDataMutation, useGetData } from "@services/base";
import type { IChequeDetails } from "@services/trh/chequeDetails/type";
import { SystemEnum } from "@type/enum";
import type { IToolbarMenu } from "@type/toolbar";
import {
  findingPageState,
  getColoredIcon,
  showInfoToast,
  showSuccessToast,
} from "@utils/core";

import { stateConfig } from "../../config";
import { actions, columnsConfig } from "./config";
import { ActionLabelsEnum } from "./enum";
import type { Action, IState } from "./type";

export const ChequeAction = () => {
  const t = useTranslations();
  const { mode = "light" } = useDarkMode();
  const initializePage = useInitializePage();

  const url = "api/trh/select/check/receipt/operations";
  const repoViewId = 140017;
  const repoId = 3024;
  const rowFieldKey = "DocumentChequeId";
  const headerKey = "CheckReceiptDetailId";
  const staticKey = "DetailDesc";
  const [pageNumber, setPageNumber] = useState(1);
  const [recordPerPage, setRecordPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedHeaderId, setSelectedHeaderId] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const [filterInfo, setFilterInfo] = useState([]);
  const [orderInfo, setOrderInfo] = useState([]);
  const [quickSearch, setQuickSearch] = useState("");

  const { match, activePage } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const activePage = state.withPersist.pages.find((page) => page.isActive);
    return { match, activePage };
  }, shallowEqual);

  const mobilePerPageCount = 100;

  const {
    data: gridData,
    isFetching: gridIsLoading,
    refetch,
  } = useGetData<IChequeDetails[], any>({
    url: url,
    body: {
      Filters: {
        FilterInfo: filterInfo,
      },
      OrderInfo: orderInfo,
      RepoViewId: repoViewId,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: match ? recordPerPage : mobilePerPageCount,
      },
      FullSearchPhrase: quickSearch,
    },

    id: "all",
  });

  const { data: gridTotal } = useGetData<null, null>({
    url: url,
    body: {
      Filters: {
        FilterInfo: filterInfo,
      },
      OrderInfo: orderInfo,
      RepoViewId: repoViewId,
      PagingInfo: {
        PageNumber: pageNumber,
        PageRecordCount: recordPerPage,
        OnlyTotalCount: true,
      },
      FullSearchPhrase: quickSearch,
    },
  });

  const [trigger, { isLoading: mutateIsLoading }] = useCUDDataMutation();

  const initialState: IState = {
    actionConfig: null,
    isChequeDynamicActionOpen: false,
    isInfoModalOpen: false,
    isCirculationModalOpen: false,
    isPrevStepConfirmationModalOpen: false,
  };

  function reducer(state: IState, action: Action): IState {
    switch (action.type) {
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
      case "OPEN_INFO_MODAL":
        return {
          ...state,
          isInfoModalOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_INFO_MODAL":
        return {
          ...state,
          isInfoModalOpen: false,
          actionConfig: null,
        };
      case "OPEN_CIRCULATION_MODAL":
        return {
          ...state,
          isCirculationModalOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_CIRCULATION_MODAL":
        return {
          ...state,
          isCirculationModalOpen: false,
          actionConfig: null,
        };
      case "OPEN_PREV_STEP_MODAL":
        return {
          ...state,
          isPrevStepConfirmationModalOpen: true,
          actionConfig: action.payload,
        };
      case "CLOSE_PREV_STEP_MODAL":
        return {
          ...state,
          isPrevStepConfirmationModalOpen: false,
          actionConfig: null,
        };
      case "CLOSE_ALL_MODAL":
        return {
          actionConfig: null,
          isChequeDynamicActionOpen: false,
          isInfoModalOpen: false,
          isCirculationModalOpen: false,
          isPrevStepConfirmationModalOpen: false,
        };

      default:
        return state;
    }
  }

  const [state, dispatchState] = useReducer(reducer, initialState);

  const handleReturn = () => {
    initializePage({
      config: {
        RepoId: 3025,
        SystemId: SystemEnum.trh,
        url: `trh/chequeReceipt?id=${selectedHeaderId}`,
        pageState: findingPageState(null),
        originalPageState: findingPageState(null),
        Id: Number(selectedHeaderId),
        listPageId: activePage.pageId,
        Key: Number(selectedHeaderId),
        selectedView: null,
        data: activePage.data,
        returnPageId: activePage.pageId,
      },
    });
    dispatchState({
      type: "CLOSE_ALL_MODAL",
    });
  };

  const handlePaginationChange = (page: number) => {
    setPageNumber(page);
  };

  const handleAction = (action: IToolbarMenu, record: any) => {
    setSelectedId(record[rowFieldKey]);
    setSelectedHeaderId([record[headerKey]]);
    setSelectedItems([record[rowFieldKey]]);
    const correctItem = gridData?.Data?.find(
      (item) => item[rowFieldKey] === selectedId,
    );

    try {
      switch (action.MenuDesc) {
        case ActionLabelsEnum.ChequeCirculation:
          dispatchState({
            type: "OPEN_CIRCULATION_MODAL",
            payload: action,
          });
          break;
        case ActionLabelsEnum.ChequeStatus:
          dispatchState({
            type: "OPEN_INFO_MODAL",
            payload: action,
          });
          break;
        case ActionLabelsEnum.PrevStep:
          dispatchState({
            type: "OPEN_PREV_STEP_MODAL",
            payload: action,
          });
          break;
        default:
          dispatchState({
            type: "OPEN_CHEQUE_DYNAMIC_ACTION_MODAL",
            payload: action,
          });
          break;
      }
    } catch (error) {
      null;
    }
  };

  const records = gridData?.Data;

  const selectedGroupCondition = selectedItems?.map((item) => {
    const correctField = records?.find((el) => el[rowFieldKey] === item);
    return stateConfig.find(
      (i) => i.value === correctField?.DocumentCheque?.StateId,
    )?.title;
  });

  const renderGroupAction = {
    render:
      selectedGroupCondition?.length > 0 &&
      selectedGroupCondition?.every(
        (item) => item === selectedGroupCondition[0],
      ),
    condition:
      selectedGroupCondition?.length > 0 ? selectedGroupCondition[0] : null,
  };

  const handlePrevStep = async () => {
    const correctItem = gridData?.Data?.find(
      (item) => item[rowFieldKey] === selectedId,
    );

    try {
      const prevStepResult = await trigger({
        url: "api/trh/update/getBackToPreviousStep",
        body: { DocumentChequeId: selectedId },
      }).unwrap();

      if (prevStepResult.Result === "Success") {
        if (state.isInfoModalOpen) {
          dispatchState({ type: "CLOSE_INFO_MODAL" });
        }
        if (state.isPrevStepConfirmationModalOpen) {
          dispatchState({ type: "CLOSE_PREV_STEP_MODAL" });
        }

        showInfoToast(t("toast.Pending"));
        showSuccessToast("", t("toast.successTitle"), 500);
        setSelectedId(null);
        refetch();
      }
    } catch (error) {
      null;
    }
  };

  const handleRefreshData = () => {
    setPageNumber(1);
    refetch();
  };

  return (
    <div className="flex flex-col items-center">
      <>
        <div className={`${match ? "relative" : ""} w-full`}>
          <div
            className={
              match ? `absolute -top-[60px] rtl:-left-[10px] -right-[10px]` : ""
            }
          >
            <ActionToolbar
              repoId={repoId}
              selectedHeaderId={selectedHeaderId}
              groupMenu={actions}
              moreMenu={[]}
              selectedItems={selectedItems}
              renderGroupAction={renderGroupAction}
              rowFieldKey={rowFieldKey}
              records={records}
              handleRefreshData={handleRefreshData}
            />
          </div>
          <ActionGridToolbar
            filterInfo={filterInfo}
            quickSearch={quickSearch}
            setFilterInfo={setFilterInfo}
            setOrderInfo={setOrderInfo}
            setPageNumber={setPageNumber}
            setQuickSearch={setQuickSearch}
            rowFieldKey={rowFieldKey}
          />
        </div>

        {!match ? (
          <ActionCard
            staticKey={staticKey as string}
            data={gridData?.Data}
            columnsConfig={columnsConfig}
            actions={actions}
            ref={lastItemRef}
            onActionClick={handleAction}
            rowFieldKey={rowFieldKey}
            selectedItems={selectedItems}
            setSelectedItems={setSelectedItems}
            headerKey={headerKey}
            selectedHeaderId={selectedHeaderId}
            setSelectedHeaderId={setSelectedHeaderId}
            isSelectMode={isSelectMode}
            setIsSelectMode={setIsSelectMode}
            loading={gridIsLoading}
            pageNumber={pageNumber}
            mobilePerPageCount={mobilePerPageCount}
            returnCount={gridTotal?.ReturnCount}
            totalCount={gridTotal?.TotalCount}
            handlePaginationChange={handlePaginationChange}
          />
        ) : (
          <ActionGrid
            actions={actions}
            columnsConfig={columnsConfig}
            data={gridData?.Data}
            loading={gridIsLoading}
            onActionClick={handleAction}
            pageNumber={pageNumber}
            recordPerPage={recordPerPage}
            rowFieldKey={rowFieldKey}
            selectedItems={selectedItems}
            setPageNumber={setPageNumber}
            setRecordPerPage={setRecordPerPage}
            setSelectedItems={setSelectedItems}
            totalCount={gridTotal?.TotalCount}
            headerKey={headerKey}
            setSelectedHeaderId={setSelectedHeaderId}
          />
        )}

        {state.isChequeDynamicActionOpen && (
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
            headerDescription={`${
              gridData?.Data?.find((item) => item[rowFieldKey] === selectedId)[
                staticKey
              ]
            }
              `}
            closeModal={() =>
              dispatchState({ type: "CLOSE_CHEQUE_DYNAMIC_ACTION_MODAL" })
            }
            isModalOpen={state.isChequeDynamicActionOpen}
            content={
              <ChequeActionModal ids={selectedHeaderId}>
                <ChequeDynamicForm
                  selectedRecords={[
                    records?.find((i) => i[rowFieldKey] === selectedId),
                  ]}
                  handleClose={() => {
                    dispatchState({
                      type: "CLOSE_CHEQUE_DYNAMIC_ACTION_MODAL",
                    });
                    refetch();
                  }}
                  sourceId={[
                    {
                      DocumentChequeId: selectedId,
                      RowNum: 1,
                    },
                  ]}
                  sourceKey={"Details"}
                  config={
                    chequeDynamicConfig.find(
                      (item) => item.name === state.actionConfig.MenuDesc,
                    )?.config
                  }
                />
              </ChequeActionModal>
            }
          />
        )}
        {state.isInfoModalOpen && (
          <CustomModal
            contentClassName={`${match ? "w-[700px] h-[400px]" : ""}`}
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
            headerDescription={`${
              gridData?.Data?.find((item) => item[rowFieldKey] === selectedId)[
                staticKey
              ]
            }
              `}
            closeModal={() => dispatchState({ type: "CLOSE_INFO_MODAL" })}
            isModalOpen={state.isInfoModalOpen}
            content={
              <ChequeActionModal ids={selectedHeaderId}>
                <ChequeInfoModal
                  id={selectedId}
                  handlePrevStep={handlePrevStep}
                  mutateIsLoading={mutateIsLoading}
                />
              </ChequeActionModal>
            }
          />
        )}
        {state.isCirculationModalOpen && (
          <CustomModal
            contentClassName={`${match ? "w-[700px] h-[400px]" : ""}`}
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
            headerDescription={`${
              gridData?.Data?.find((item) => item[rowFieldKey] === selectedId)[
                staticKey
              ]
            }
              `}
            closeModal={() =>
              dispatchState({ type: "CLOSE_CIRCULATION_MODAL" })
            }
            isModalOpen={state.isCirculationModalOpen}
            content={
              <ChequeActionModal
                ids={selectedHeaderId}
                handleReturn={handleReturn}
              >
                <ChequeCirculationModal id={selectedId} />
              </ChequeActionModal>
            }
          />
        )}
        {state.isPrevStepConfirmationModalOpen && (
          <CustomModal
            width={300}
            centered
            disableTitle
            closeModal={() => dispatchState({ type: "CLOSE_PREV_STEP_MODAL" })}
            isModalOpen={state.isPrevStepConfirmationModalOpen}
            content={
              <Confirmation
                itemsToConfirm={selectedId}
                mode="Confirm"
                onLoading={mutateIsLoading}
                onCancel={() =>
                  dispatchState({ type: "CLOSE_PREV_STEP_MODAL" })
                }
                onConfirm={handlePrevStep}
              />
            }
          />
        )}
      </>
    </div>
  );
};
