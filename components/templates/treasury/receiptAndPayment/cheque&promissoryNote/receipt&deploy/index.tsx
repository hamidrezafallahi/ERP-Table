"use client";

import React from 'react';

import { ERPTable } from '@components/organisms/erp-table';
import { useERPGrid } from '@components/organisms/erp-table/ui/useERPGrid';
import {
  Receipt_DeployForm,
} from '@components/organisms/treasury/receiptAndPayment/cheque&promissoryNote';
import { GridContainedPageProps } from '@type/elementType';

import { CheckDocumentOperationType } from '../enum';
import {
  checkColumnConfig,
  formConfig,
} from './checkConfig';
import { promissoryNoteColumnConfig } from './promissoryNoteConfig';

const Receipt_DeployTemplate = <T, K>({ ...props }: GridContainedPageProps) => {
  const {
    form,
    type,
  } = props;
  const { pageReady, handleSubmit, setController, tableProps, id, toolbar } =
    useERPGrid({
      ...props,
       formConfig,
      columnConfig: [
        CheckDocumentOperationType.ReceivePromissoryNote,
        CheckDocumentOperationType.DeployPromissoryNote,
      ].includes(type)
        ? promissoryNoteColumnConfig
        : checkColumnConfig,
    });

    return (
    <div className="flex flex-col gap-8">
      <Receipt_DeployForm
        type={type}
        form={form}
        onSubmitCallback={handleSubmit}
      />
      {pageReady && (
        <div>
          <ERPTable //<IMoreProps>
            {...tableProps}
            // moreDetailComponent={More}
            onReady={(controller) => {
              setController(controller);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Receipt_DeployTemplate;
