"use client";
import { useMemo } from 'react';

import { shallowEqual } from 'react-redux';

import {
  IssuanceChequeForm,
} from '@components/molecules/receiptAndPayment/cheque';
import { ERPTable } from '@components/organisms/erp-table';
import { useERPGrid } from '@components/organisms/erp-table/ui/useERPGrid';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { GridContainedPageProps } from '@type/elementType';

import {
  columnConfig,
  formConfig,
} from './config';

export default function ChequeIssuance<T, K>({
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
    setIsFormSubmitting,
  } = props;
  const { bankAccountId } = useAppSelector(
    (state) => ({
      bankAccountId: state?.withPersist?.pages
        ?.find((item) => item.isActive)
        ?.pageData?.find((i) => i.name === "BankAccountId")?.value,
    }),
    shallowEqual,
  );

  const colConfig = useMemo(() => {
    return columnConfig(bankAccountId);
  }, [bankAccountId]);
  const { pageReady, handleSubmit, setTableApi, tableProps } = useERPGrid({
    headerGetUrl,
    DefaultHeaderRepoViewId: 3023,
    formConfig,
    headerFieldKey,
    detailGetUrl,
    DefaultDetailRepoViewId: 3022,
    detailFieldKey,
    addUrl,
    updateUrl,
    listUrl,
    caption,
    pageIcon,
    captionII,
    storeName: "chequeIssuance",
    tableTitle,
    columnConfig: colConfig,
    formHeight: 580,
    setIsFormSubmitting,
  });

  return (
    <>
      <div className="flex flex-col gap-1">
        <IssuanceChequeForm form={form} onSubmitCallback={handleSubmit} />
        {pageReady && bankAccountId && (
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
      </div>
    </>
  );
}
