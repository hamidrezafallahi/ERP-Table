"use client";
import React, {
  useEffect,
  useMemo,
} from 'react';

import { useTranslations } from 'next-intl';

import {
  VoucherForm,
  VoucherResult,
} from '@components/molecules/accounting';
import { ERPTable } from '@components/organisms/erp-table/ui';
import { useERPGrid } from '@components/organisms/erp-table/ui/useERPGrid';
import { GridContainedPageProps } from '@type/elementType';

import {
  columnConfig,
  formConfig,
} from './config';

export default function VoucherTemplate<T, K>({
  ...props
}: GridContainedPageProps) {
  const {
    form,
  } = props;
  const [sum, setSum] = React.useState<{ bed: number; bes: number }>({
    bed: 0,
    bes: 0,
  });
  const t = useTranslations();

 
  const memoizedColumns = useMemo(() => columnConfig(t), []);

  const { pageReady, handleSubmit, setController, controller, tableProps } =
    useERPGrid({
      ...props,
      formConfig,
      columnConfig: memoizedColumns,
    });

  // const { data: renderUnitData } = useGetData<IPlaceConfig[], null>({
  //   url: `/api/mng/select/placeConfigValue`,
  //   body: {},
  // });
  // const rowAccess = {
  //   denyRoles: ["VIEWER"],
  // allowRoles: ["ADMIN"],
  // rule(ctx) {
  //   return false;
  // },
  // };
  useEffect(() => {
    if (!controller) {
      return;
    }

    const data = controller.getSnapShot() as any;
    setSum({
      bed: data.rows.reduce((acc, curr) => {
        const val = curr.cells["Bed"];
        const num = typeof val === "object" ? val?.value : val;
        return acc + (Number(num) || 0);
      }, 0),
      bes: data.rows.reduce((acc, curr) => {
        const val = curr.cells["Bes"];
        const num = typeof val === "object" ? val?.value : val;
        return acc + (Number(num) || 0);
      }, 0),
    });

    const unsubscribe1 = controller.subscribeColumn<{
      id: number;
      rowNum: number;
      value: number;
    }>("Bed", (values) => {
      setSum((prev) => ({
        ...prev,
        bed: values.reduce((acc, curr) => acc + curr.value, 0),
      }));
    });

    const unsubscribe2 = controller.subscribeColumn<{
      id: number;
      rowNum: number;
      value: number;
    }>("Bes", (values) => {
      setSum((prev) => ({
        ...prev,
        bes: values.reduce((acc, curr) => acc + curr.value, 0),
      }));
    });
    return () => {
      unsubscribe1?.();
      unsubscribe2?.();
    };
  }, [controller]);
  return (
    <>
      <VoucherForm form={form} onSubmitCallback={handleSubmit} />
      <div className="flex flex-col gap-5 pt-5">
        {pageReady && (
          <>
            <ERPTable //<IMoreProps>
              {...tableProps}
              // moreDetailComponent={More}
              onReady={(controller) => {
                setController(controller);
              }}
            />
            <div className="flex justify-end w-full">
              <VoucherResult
                balance={sum.bes - sum.bed}
                totalCredit={sum.bes}
                totalDebit={sum.bed}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
// interface IMoreProps {
//   data: unknown;
// }

// const More = ({ data }: IMoreProps) => {
//   const moreDetail = data;
//   console.log(moreDetail);
//   return <>test</>;
// };
