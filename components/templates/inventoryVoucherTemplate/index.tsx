"use client";
import React, {
  useEffect,
  useMemo,
} from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import {
  InventoryVoucherHeaderForm,
} from '@components/molecules/inventoryVoucher';
import { ERPTable } from '@components/organisms/erp-table';
import { useERPGrid } from '@components/organisms/erp-table/ui/useERPGrid';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { setPageData } from '@slice/pages';

import {
  columnConfig,
  formConfig,
} from './config';
import { IProps } from './type';

export default function InventoryVoucherTemplate<T, K>({ ...props }: IProps) {
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
    setIsFormSubmitting,
  } = props;

  const { activePage } = useAppSelector(
    (state) => ({
      activePage: state?.withPersist?.pages?.find((item) => item.isActive),
      pages: state?.withPersist?.pages,
    }),
    shallowEqual,
  );
  const vti = activePage?.data?.VoucherTypeId;
  const internal = activePage?.data?.InOut == 0 || activePage?.data?.InOut == 1;
  const NeedReference = activePage?.data?.NeedReference;
  const StockId = activePage?.pageData?.find((d) => d.name == "StockId")?.value;
  const VoucherHeaderId = activePage?.pageData?.find(
    (d) => d.name == "VoucherHeaderId",
  )?.value;
  const titleKey = "VoucherNumber";
  const dispatch = useDispatch()
  const formHeight = 420;
  const colConfigs = useMemo(() => {
    return columnConfig(vti, internal, NeedReference, StockId, VoucherHeaderId);
  }, [vti, internal, NeedReference, StockId, VoucherHeaderId]);
  const { pageReady, handleSubmit, setTableApi, tableApi, tableProps } =
    useERPGrid({
      headerGetUrl,
      DefaultHeaderRepoViewId: 10011,
      formConfig,
      headerFieldKey,
      detailGetUrl,
      DefaultDetailRepoViewId: 70003,
      detailFieldKey,
      titleKey,
      addUrl,
      updateUrl,
      listUrl,
      caption,
      pageIcon,
      captionII,
      storeName: "Voucher",
      tableTitle: "اقلام سند",
      columnConfig: colConfigs,
      formHeight,
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
  // useEffect(() => {
  //   if (!tableApi) {
  //     return;
  //   }
  //   const unsubscribe = tableApi.subscribeColumn<number>(
  //     "Quantity1",
  //     (values) => {
  //       console.log("COLUMN CHANGED:", values);
  //     },
  //   );
  //   return () => {
  //     unsubscribe?.();
  //   };
  // }, [tableApi]);
  useEffect(() => {
    if (pageReady && vti) dispatch(setPageData({ name: "VoucherTypeId",value:vti,originalValue:vti }));
  }, [pageReady]);

  return (
    <div className="flex flex-col gap-10">
      <InventoryVoucherHeaderForm form={form} onSubmitCallback={handleSubmit} />
      {pageReady && activePage?.pageId && StockId && (
        <ERPTable //<IMoreProps>
          {...tableProps}
          // moreDetailComponent={More}
          onReady={(api) => {
            setTableApi(api);
          }}
        />
      )}
    </div>
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
