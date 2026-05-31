"use client";
import {
  ReceiptChequeForm,
} from '@components/molecules/receiptAndPayment/cheque';
import { ERPTable } from '@components/organisms/erp-table';
import { useERPGrid } from '@components/organisms/erp-table/ui/useERPGrid';
import { GridContainedPageProps } from '@type/elementType';

import {
  columnConfig,
  formConfig,
} from './config';

export default function ChequeReceiptTemplate<T, K>({
  ...props
}: GridContainedPageProps) {
  const {
    form,
    caption,
    captionII,
    listUrl,
    pageIcon,
    detailFieldKey,
    headerFieldKey,
    headerGetUrl,
    detailGetUrl,
    addUrl,
    updateUrl,
    tableTitle,
    fieldKey,
    setIsFormSubmitting
   } = props;
  const { pageReady, handleSubmit, setTableApi, tableProps, id, toolbar } =
    useERPGrid({
      headerGetUrl,
      DefaultHeaderRepoViewId: 140018,
      formConfig,
      headerFieldKey,
      detailGetUrl,
      DefaultDetailRepoViewId: 140017,
      detailFieldKey,
      addUrl,
      updateUrl,
      listUrl,
      caption,
      pageIcon,
      captionII,
      storeName: "receiptAndPayment",
      tableTitle,
      columnConfig: columnConfig,
      formHeight: 500,
      setIsFormSubmitting,
    });

  return (
    <>
      <ReceiptChequeForm form={form} onSubmitCallback={handleSubmit} />
      {pageReady && (
        <div>
          <ERPTable //<IMoreProps>
            {...tableProps}
            // moreDetailComponent={More}
            onReady={(api) => {
              setTableApi(api);
            }}
          />
        </div>
      )}
    </>
  );
}
