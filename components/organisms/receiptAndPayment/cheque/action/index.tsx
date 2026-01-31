"use client";
import { useEffect, useReducer, useRef, useState } from "react";

import { shallowEqual } from "react-redux";

import { CustomModal, CustomSpin } from "@components/atoms/defaultElements";
import {
  ActionGrid,
  ActionGridToolbar,
  ActionToolbar,
  ChequeActionModal,
  ChequeDynamicForm,
} from "@components/molecules/receiptAndPayment/cheque";
import ActionCard from "@components/molecules/receiptAndPayment/cheque/actionCard";
import { chequeDynamicConfig } from "@components/molecules/receiptAndPayment/cheque/chequeDynamicForm/config";
import { useDarkMode } from "@hooks/custom";
import { useAppSelector } from "@redux/index";
import { useGetData, useGetInfinite } from "@services/base";
import type { IChequeDetails } from "@services/trh/chequeDetails/type";
import type { IToolbarMenu } from "@type/toolbar";
import { getColoredIcon } from "@utils/core";

import { stateConfig } from "../../config";
import { actions, columnsConfig } from "./config";
import type { Action, IState } from "./type";

export const ChequeAction = () => {
  const { mode = "light" } = useDarkMode();

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
  const observer = useRef<IntersectionObserver | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const [filterInfo, setFilterInfo] = useState();
  const [orderInfo, setOrderInfo] = useState();
  const [quickSearch, setQuickSearch] = useState("");

  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;

    return { match };
  }, shallowEqual);

  const { data: gridData, isFetching: gridIsLoading } = useGetData<
    IChequeDetails[],
    any
  >({
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
      },
      FullSearchPhrase: quickSearch,
    },
    skip: !match,
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
    skip: !match,
  });

  const {
    data: cardData,
    isFetching: cardIsFetching,
    isLoading: cardIsLoading,
  } = useGetInfinite<IChequeDetails[], any>({
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
      },
      FullSearchPhrase: quickSearch,
    },
    skip: match,
    id: "all",
  });

  const initialState: IState = {
    actionConfig: null,
    isChequeDynamicActionOpen: false,
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

      default:
        return state;
    }
  }

  const [state, dispatchState] = useReducer(reducer, initialState);

  useEffect(() => {
    if (
      !match &&
      cardData?.Data?.length > 0 &&
      cardData?.ReturnCount === Number(recordPerPage)
    ) {
      const pageNumberCount = pageNumber;

      const observerCallback = (entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting && !cardIsFetching) {
          pageNumberCount
            ? setPageNumber(pageNumberCount + 1)
            : setPageNumber(1);
        }
      };

      observer.current = new IntersectionObserver(observerCallback);
      const currentLastItem = lastItemRef.current;

      if (currentLastItem) observer.current.observe(currentLastItem);

      return () => {
        if (observer.current && currentLastItem)
          observer.current.unobserve(currentLastItem);
      };
    }
  }, [cardIsFetching, pageNumber, match, cardData?.Data?.length]);

  const handleAction = (action: IToolbarMenu, record: any) => {
    setSelectedId(record[rowFieldKey]);
    setSelectedHeaderId([record[headerKey]]);
    setSelectedItems([record[rowFieldKey]]);

    try {
      switch (action.MenuDesc) {
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

  const records = gridData?.Data ?? cardData?.Data;

  const selectedGroupCondition = selectedItems?.map((item) => {
    const correctField = records?.find((el) => el[rowFieldKey] === item);
    return stateConfig.find(
      (i) => i.value === correctField?.DocumentCheque?.StateId
    )?.title;
  });

  const renderGroupAction = {
    render:
      selectedGroupCondition?.length > 0 &&
      selectedGroupCondition?.every(
        (item) => item === selectedGroupCondition[0]
      ),
    condition:
      selectedGroupCondition?.length > 0 ? selectedGroupCondition[0] : null,
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
          !cardIsLoading ? (
            <ActionCard
              staticKey={staticKey as string}
              data={cardData?.Data}
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
            />
          ) : (
            <div className="flex items-center w-full h-[500px]">
              <CustomSpin className="w-full" size="large" />
            </div>
          )
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
        {!cardIsLoading && cardIsFetching && (
          <CustomSpin className="w-full" size="large" />
        )}

        {state.isChequeDynamicActionOpen && (
          <CustomModal
            contentClassName={`${match ? "w-[700px] h-[470px]" : ""}`}
            headerName={state.actionConfig.MenuDesc}
            headerIcon={
              match && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: getColoredIcon(state.actionConfig.Icon, mode),
                  }}
                  style={{ width: "18px", height: "17px" }}
                />
              )
            }
            headerDescription={`${
              match
                ? gridData?.Data?.find(
                    (item) => item[rowFieldKey] === selectedId
                  )[staticKey]
                : cardData?.Data?.find(
                    (item) => item[rowFieldKey] === selectedId
                  )[staticKey]
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
                  handleClose={() =>
                    dispatchState({ type: "CLOSE_CHEQUE_DYNAMIC_ACTION_MODAL" })
                  }
                  sourceId={[
                    {
                      DocumentChequeId: selectedId,
                      RowNum: 1,
                    },
                  ]}
                  sourceKey={"Details"}
                  config={
                    chequeDynamicConfig.find(
                      (item) => item.name === state.actionConfig.MenuDesc
                    )?.config
                  }
                />
              </ChequeActionModal>
            }
          />
        )}
      </>
    </div>
  );
};
