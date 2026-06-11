"use client";
import {
  useEffect,
  useState,
} from 'react';

import { shallowEqual } from 'react-redux';

import DynamicLevelFields from '@components/molecules/dynamicLevelFields';
import { Level4TypeEnum } from '@components/molecules/dynamicLevelFields/enum';
import { WithdrawalTab } from '@components/molecules/receiptAndPayment';
import {
  AdvancedBankWithdrawalForm,
} from '@components/molecules/receiptAndPayment/bank';
import type { IActiveTab } from '@components/molecules/receiptAndPayment/type';
import { ERPTable } from '@components/organisms/erp-table';
import { useERPGrid } from '@components/organisms/erp-table/ui/useERPGrid';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { GridContainedPageProps } from '@type/elementType';

import {
  columnConfig,
  formConfig,
} from './config';

export default function AdvancedBankWithdrawal<T, K>({
  ...props
}: GridContainedPageProps) {
  const { form } = props;
  const [totalDebit, setTotalDebit] = useState<number>(0);
  const [active, setActive] = useState<IActiveTab>({
    key: "صندوق",
    value: 1,
    fieldKey: "CashStatementId",
    detailKey: "CashStatements",
    detailCaption: "صندوق",
  });

  const { pageReady, handleSubmit, setController, tableProps, controller } =
    useERPGrid({
      ...props,
      tableType: "CashStatements",
      formConfig,
      columnConfig: columnConfig,
    });

  const { activePage, accountId } = useAppSelector(
    (state) => ({
      activePage: state.withPersist.pages?.find(
        (item) => item.isActive === true,
      ),
      accountId: state?.withPersist?.pages
        ?.find((item) => item.isActive)
        ?.pageData?.find((i) => i.name === "BankAccountId")?.value,
    }),
    shallowEqual,
  );

  useEffect(() => {
    if (!controller) {
      return;
    }
    const data = controller.getSnapShot() as any;
    setTotalDebit(
      data.rows.reduce((acc, curr) => {
        const val = curr.cells["Price"];
        const num = typeof val === "object" ? val?.value : val;
        return acc + (Number(num) || 0);
      }, 0),
    );

    const unsubscribe1 = controller.subscribeColumn<{
      id: number;
      rowNum: number;
      value: number;
    }>("Price", (values) => {
      setTotalDebit(values.reduce((acc, curr) => acc + (curr.value || 0), 0));
    });

    return () => {
      unsubscribe1?.();
    };
  }, [controller]);

  const activeHandler = (e: IActiveTab) => {
    setActive(e);
    controller.dispatch({
      type: "UI_CHANGE_TABLE_TYPE",
      tableType: e.detailKey,
    });
  };
  return (
    <div className="flex flex-col gap-8">
      <AdvancedBankWithdrawalForm
        activePage={activePage}
        form={form}
        handleSubmit={handleSubmit}
        totalDebit={totalDebit}
      />
      <DynamicLevelFields
        accountId={accountId}
        form={form}
        level4Type={Level4TypeEnum.Person}
      />

      <WithdrawalTab active={active} handleActive={activeHandler} />
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
}
