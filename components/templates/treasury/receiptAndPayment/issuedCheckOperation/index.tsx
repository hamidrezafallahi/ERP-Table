"use client";
import {
  ActionGridToolbar,
  ActionToolbar,
} from "@components/molecules/receiptAndPayment/cheque";
import { actions } from "@components/organisms/receiptAndPayment/action/config";
import { useAppSelector } from "@hooks/custom/useAppSelector";
import { addNewPage } from "@slice/pages";
import { HeaderTypeEnum } from "@slice/pages/enum";
import { PageTypeEnum } from "@type/enum";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { shallowEqual, useDispatch } from "react-redux";
import { columnsConfig } from "./config";
import { useChequeGroupActions } from "@components/organisms/treasury/receiptAndPayment/hooks/useChequeGroupActions";
import { useIssuedCheckActionHandlers } from "@components/organisms/treasury/receiptAndPayment/issuedCheckOperation/hooks/useIssuedCheckActionHandlers";
import {
  issuedCheckReducer,
  initialState,
} from "@components/organisms/treasury/receiptAndPayment/issuedCheckOperation/reducer/issuedCheckReducer";
import IssuedCheckGridSection from "@components/organisms/treasury/receiptAndPayment/issuedCheckOperation/issuedCheckGridSection";
import { useChequeOperations } from "@components/organisms/treasury/receiptAndPayment/hooks/useChequeOperations";

const IssuedCheckOperationTemplate = () => {
  const dispatch = useDispatch();
  const rowFieldKey = "DocumentChequeId";
  const headerKey = "CheckReceiptDetailId";
  const staticKey = "DetailDesc";
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedHeaderId, setSelectedHeaderId] = useState<number[]>([]);
  const lastItemRef = useRef<HTMLDivElement | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [state, dispatchState] = useReducer(issuedCheckReducer, initialState);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const { initPage, match } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual,
  );

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
    url: "api/trh/select/check/Issuance/operations",
  });
  const records = gridData?.Data;

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: initPage.pageId,
        caption: "title.issuedCheckOperation",
        icon: "IssuingProformaInvoiceIcon",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
        url: "trh/issuedCheckOperation",
        listPageId: initPage?.listPageId,
        headerType: HeaderTypeEnum.MobileWithoutSearch,
        returnPageId: initPage.pageId,
      }),
    );
  }, []);
  const renderGroupAction = useChequeGroupActions(
    selectedItems,
    records,
    rowFieldKey,
  );

  const { handleAction, handlePrevStep } = useIssuedCheckActionHandlers({
    trigger,
    refetch,
    dispatchState,
    selectedId,
    rowFieldKey,
    headerKey,
    setSelectedId,
    setSelectedHeaderId,
    setSelectedItems,
  });

  const handleRefreshData = () => {
    setPageNumber(1);
    refetch();
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
                      repoId={null}
                      selectedHeaderId={selectedHeaderId}
                      groupMenu={actions}
                      moreMenu={[]}
                      selectedItems={selectedItems}
                      renderGroupAction={renderGroupAction}
                      rowFieldKey={rowFieldKey}
                      records={records}
                      handleRefreshData={handleRefreshData} selectedDetails={[]}          />
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
      <IssuedCheckGridSection
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
    </div>
  );
};

export default IssuedCheckOperationTemplate;
