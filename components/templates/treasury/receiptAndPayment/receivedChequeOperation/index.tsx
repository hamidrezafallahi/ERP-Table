"use client";
import { useReducer, useRef, useState } from "react";
import { shallowEqual } from "react-redux";
import {
  ActionGridToolbar,
  ActionToolbar,
} from "@components/molecules/receiptAndPayment/cheque";
import { useDarkMode, useInitializePage } from "@hooks/custom";
import { useAppSelector } from "@hooks/custom/useAppSelector";
import { SystemEnum } from "@type/enum";
import { findingPageState } from "@utils/core";
import {
  actions,
  columnsConfig,
} from "@components/organisms/receiptAndPayment/action/config";
import { useChequeOperations } from "@components/organisms/treasury/receiptAndPayment/hooks/useChequeOperations";
import {
  chequeReducer,
  initialState,
} from "@components/organisms/treasury/receiptAndPayment/receivedChequeOperation/reducer/chequeReducer";
import { useChequeActionHandlers } from "@components/organisms/treasury/receiptAndPayment/receivedChequeOperation/hooks/useChequeActionHandlers";
import ChequeGridSection from "@components/organisms/treasury/receiptAndPayment/receivedChequeOperation/chequeGridSection";
import ChequeModals from "@components/organisms/treasury/receiptAndPayment/receivedChequeOperation/chequeModals";
import { useChequeGroupActions } from "@components/organisms/treasury/receiptAndPayment/hooks/useChequeGroupActions";

export const ReceivedChequeOperationTemplate = () => {
  const { mode = "light" } = useDarkMode();
  const initializePage = useInitializePage();
  const repoViewId = 140017;
  const repoId = 3024;
  const rowFieldKey = "DocumentChequeId";
  const headerKey = "CheckReceiptDetailId";
  const staticKey = "DetailDesc";
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedDetails, setSelectedDetails] = useState([]);
  const [selectedHeaderId, setSelectedHeaderId] = useState<number[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const { match, activePage } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    const activePage = state.withPersist.pages?.find((page) => page.isActive);
    return { match, activePage };
  }, shallowEqual);


  console.log({selectedItems});
  
  const {
    data: gridData,
    total: gridTotal,
    isFetching: gridIsLoading,
    refetch,
    trigger,
    isLoading: mutateIsLoading,
    pageNumber,
    setPageNumber,
    recordPerPage,
    setRecordPerPage,
    filterInfo,
    setFilterInfo,
    setOrderInfo,
    quickSearch,
    setQuickSearch,
    mobilePerPageCount,
  } = useChequeOperations({
    match,
    repoViewId,
    url: "api/trh/select/check/receipt/operations",
  });

  const [state, dispatchState] = useReducer(chequeReducer, initialState);

  const { handleAction, handlePrevStep } = useChequeActionHandlers({
    trigger,
    refetch,
    dispatchState,
    selectedId,
    rowFieldKey,
    headerKey,
    setSelectedId,
    setSelectedHeaderId,
    setSelectedItems,
    setSelectedDetails,
  });

  const records = gridData?.Data;

  const renderGroupAction = useChequeGroupActions(
    selectedItems,
    records,
    rowFieldKey,
  );

  const handleRefreshData = () => {
    setPageNumber(1);
    refetch();
  };

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

    dispatchState({ type: "CLOSE_ALL_MODAL" });
  };

  return (
    <div className="flex flex-col items-center">
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
            selectedDetails={selectedDetails}
            setSelectedDetails={setSelectedDetails}
            setSelectedItems={setSelectedItems}
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
      <ChequeGridSection
        match={match}
        staticKey={staticKey}
        data={records}
        columnsConfig={columnsConfig}
        actions={actions}
        ref={lastItemRef}
        onActionClick={handleAction}
        rowFieldKey={rowFieldKey}
        selectedItems={selectedItems}
        setSelectedItems={setSelectedItems}
        setSelectedDetails={setSelectedDetails}
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
        handlePaginationChange={setPageNumber}
        recordPerPage={recordPerPage}
        setPageNumber={setPageNumber}
        setRecordPerPage={setRecordPerPage}
      />
      <ChequeModals
        state={state}
        dispatchState={dispatchState}
        match={match}
        mode={mode}
        gridData={gridData}
        selectedId={selectedId}
        rowFieldKey={rowFieldKey}
        staticKey={staticKey}
        selectedHeaderId={selectedHeaderId}
        records={records}
        refetch={refetch}
        mutateIsLoading={mutateIsLoading}
        handlePrevStep={handlePrevStep}
        handleReturn={handleReturn}
        selectedDetails={selectedDetails}
        setSelectedDetails={setSelectedDetails}
        setSelectedItems={setSelectedItems}
      />
    </div>
  );
};
