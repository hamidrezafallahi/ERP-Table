"use client";
import React, {
  useEffect,
  useMemo,
} from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import {
  VoucherForm,
  VoucherResult,
} from '@components/molecules/accounting';
import { ERPTable } from '@components/organisms/erp-table/ui';
import { useERPGrid } from '@components/organisms/erp-table/ui/useERPGrid';
import { useAppSelector } from '@hooks/custom/useAppSelector';

import {
  columnConfig,
  formConfig,
} from './config';
import { IProps } from './type';

export default function VoucherTemplate<T, K>({ ...props }: IProps) {
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
  const [sum, setSum] = React.useState<{ bed: number; bes: number }>({
    bed: 0,
    bes: 0,
  });
  const t = useTranslations();

  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state?.withPersist?.pages?.find((item) => item.isActive),
      pages: state?.withPersist?.pages,
    }),
    shallowEqual,
  );
  const memoizedColumns = useMemo(() => columnConfig(t), []);

  const { pageReady, handleSubmit, setTableApi, tableApi, tableProps } =
    useERPGrid({
      headerGetUrl,
      DefaultHeaderRepoViewId: 10011,
      formConfig,
      headerFieldKey,
      detailGetUrl,
      DefaultDetailRepoViewId: 70003,
      detailFieldKey,
      addUrl,
      updateUrl,
      listUrl,
      caption,
      pageIcon,
      captionII,
      storeName: "Voucher",
      tableTitle,
      columnConfig: memoizedColumns,
      formHeight: 500,
      recordHeight: 40,
      mobileRecordsPerPage: 100,
      setIsFormSubmitting,
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
    if (!tableApi) {
      return;
    }

    const data = tableApi.getSnapShot() as any;
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
    const unsubscribe1 = tableApi.subscribeColumn<{
      id: number;
      rowNum: number;
      value: number;
    }>("Bed", (values) => {
      setSum((prev) => ({
        ...prev,
        bed: values.reduce((acc, curr) => acc + (curr.value || 0), 0),
      }));
    });
    const unsubscribe2 = tableApi.subscribeColumn<{
      id: number;
      rowNum: number;
      value: number;
    }>("Bes", (values) => {
      setSum((prev) => ({
        ...prev,
        bes: values.reduce((acc, curr) => acc + (curr.value || 0), 0),
      }));
    });
    return () => {
      unsubscribe1?.();
      unsubscribe2?.();
    };
  }, [tableApi]);
  return (
    <>
      <VoucherForm form={form} onSubmitCallback={handleSubmit} />
      <div className="flex flex-col gap-5 -translate-y-5">
        {pageReady && activePage?.pageId && (
          <>
            <ERPTable //<IMoreProps>
              {...tableProps}
              // moreDetailComponent={More}
              onReady={(api) => {
                setTableApi(api);
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
