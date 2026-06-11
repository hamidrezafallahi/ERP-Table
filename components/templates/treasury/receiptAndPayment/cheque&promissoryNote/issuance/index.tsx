"use client";
import { useEffect, useMemo, useState } from "react";

import { shallowEqual } from 'react-redux';

import { ERPTable } from '@components/organisms/erp-table';
import { useERPGrid } from '@components/organisms/erp-table/ui/useERPGrid';
import {
  Cheque_PromissoryNoteIssuanceForm,
} from '@components/organisms/treasury/receiptAndPayment/cheque&promissoryNote';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { GridContainedPageProps } from '@type/elementType';

import { CheckDocumentOperationType } from '../enum';
import {
  checkColumnConfig,
  checkFormConfig,
  multiSelectConfig,
} from "./checkConfig";
import { promissoryNoteFormConfig } from "./promissoryNoteConfig";
import { Form } from "antd";

export default function IssuanceTemplate<T, K>({
  ...props
}: GridContainedPageProps) {
  const {
    form,
    type,
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
    return checkColumnConfig(bankAccountId);
  }, [bankAccountId]);

  const { pageReady, handleSubmit, setController, tableProps } = useERPGrid({
    ...props,
    formConfig: [
      CheckDocumentOperationType.IssuedCheck,
      CheckDocumentOperationType.IssuedPromissoryNote,
    ].includes(type)
      ? promissoryNoteFormConfig
      : checkFormConfig,
    columnConfig: colConfig,
    formHeight: 580,
    multiSelectConfig: multiSelectConfig(bankAccountId),
  });

  const [dynamicHeight, setDynamicHeight] = useState<number | null>();
  const rpWayId = Form.useWatch("RpWayId", form);  

  useEffect(() => {
    const handleResize = () => {
      const height = rpWayId ? 470 : 420;
      const availableHeight = window.innerHeight - height;
      setDynamicHeight(availableHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [rpWayId]);

  return (
    <>
      <div className="flex flex-col gap-8">
        <Cheque_PromissoryNoteIssuanceForm
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
              {...(dynamicHeight ? { tableHeight: dynamicHeight } : {})}
            />
          </div>
        )}
      </div>
    </>
  );
}
