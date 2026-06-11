import {
  ActionGridToolbar,
  ActionToolbar,
} from "@components/molecules/receiptAndPayment/cheque";
import { actions } from "@components/organisms/receiptAndPayment/action/config";

import React from "react";

const ChequeToolbarSection = (
  match,
  repoId,
  selectedHeaderId,
  selectedItems,
  renderGroupAction,
  records,
  handleRefreshData,
  filterInfo,
  quickSearch,
  setFilterInfo,
  setOrderInfo,
  setPageNumber,
  setQuickSearch,
  rowFieldKey,
) => {
  return (
    <>
      <ActionToolbar
              repoId={repoId}
              selectedHeaderId={selectedHeaderId}
              groupMenu={actions}
              moreMenu={[]}
              selectedItems={selectedItems}
              renderGroupAction={renderGroupAction}
              rowFieldKey={rowFieldKey}
              records={records}
              handleRefreshData={handleRefreshData} selectedDetails={[]}      />
      <ActionGridToolbar
        filterInfo={filterInfo}
        quickSearch={quickSearch}
        setFilterInfo={setFilterInfo}
        setOrderInfo={setOrderInfo}
        setPageNumber={setPageNumber}
        setQuickSearch={setQuickSearch}
        rowFieldKey={rowFieldKey}
      />
    </>
  );
};

export default ChequeToolbarSection;
