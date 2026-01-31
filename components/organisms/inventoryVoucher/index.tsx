"use client";
import { useEffect } from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import Title from '@components/atoms/Title';
import { useAppSelector } from '@redux/index';
import { useGetData } from '@services/base';
import type {
  IInventoryVoucherType,
  IRequest,
} from '@services/inv/inventoryVoucherType/type';
import { addNewPage } from '@slice/pages';
import {
  PageTypeEnum,
  SystemEnum,
} from '@type/enum';

import { InOutEnum } from './enum';
import {
  InventoryVoucherToolbar,
  MainInfoSection,
} from './main';

export default function InventoryVoucher() {
  const { data } = useGetData<IInventoryVoucherType[], IRequest>({
    url: "/api/com/select/voucherType/inv",
    body: {
      RepoViewId: 30085,
    },
    id: "global",
  });
  const inboundData = {
    title: "ورود",
    list: data?.Data?.filter(
      (item) =>
        item.InOut === InOutEnum.Inbound ||
        item.InOut === InOutEnum.NeutralInbound
    )?.map((item: IInventoryVoucherType) => ({
      label: item.VoucherTypeDesc,
      record: 170,
      formUrl: `inv/inventoryVoucherForm`,
      formRepoId: 2002,
      voucherTypeId: item.VoucherTypeId,
      isInventoryTransfer: item.IsInventoryTransfer,
      hasThirdParty: item.HasThirdParty,
      tafsiliTypeId: item.TafsiliTypeId,
      NeedReference: item.NeedReference,
      formSystemId: SystemEnum.inv,
      listUrl: `inv/inventoryVoucherList`,
      listRepoId: 2002,
      listSystemId: SystemEnum.inv,
      InOut: item.InOut,
      InOutTypeDesc: item.InOutTypeDesc,
      NeedQualityControl: item.NeedQualityControl,
      VoucherReference: item.VoucherReference,
      keyName: "VoucherTypeId",
      keyValue: item.VoucherTypeId,
    })),
  };
  const outboundData = {
    title: "خروج",
    list: data?.Data?.filter(
      (item) =>
        item.InOut === InOutEnum.Outbound ||
        item.InOut === InOutEnum.NeutralOutbound
    )?.map((item: IInventoryVoucherType) => ({
      label: item.VoucherTypeDesc,
      record: 180,
      formUrl: `inv/inventoryVoucherForm`,
      formRepoId: 2002,
      voucherTypeId: item.VoucherTypeId,
      isInventoryTransfer: item.IsInventoryTransfer,
      hasThirdParty: item.HasThirdParty,
      tafsiliTypeId: item.TafsiliTypeId,
      NeedReference: item.NeedReference,
      formSystemId: SystemEnum.inv,
      listUrl: `inv/inventoryVoucherList`,
      listRepoId: 2002,
      listSystemId: SystemEnum.inv,
      InOut: item.InOut,
      InOutTypeDesc: item.InOutTypeDesc,
      NeedQualityControl: item.NeedQualityControl,
      VoucherReference: item.VoucherReference,
      keyName: "VoucherTypeId",
      keyValue: item.VoucherTypeId,
    })),
  };

  const dispatch = useDispatch();

  const { initPage, match } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
      match: state.withPersist.config.initMatch,
    }),
    shallowEqual
  );

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: initPage.pageId,
        caption: `title.inventoryVoucher`,
        icon: "StockIcon",
        pageState: initPage.pageState,
        originalPageState: initPage.originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: initPage.RepoId,
        SystemId: initPage.SystemId,
        url: "inv/inventoryVoucher",
        listPageId: initPage?.listPageId,
      })
    );
  }, []);

  return (
    // <div className="flex flex-col items-center">
    <>
      <Title caption={"title.inventoryVoucher"} />
      <div className={`${match ? "relative" : ""} w-full`}>
        <div
          className={
            match ? `absolute -top-[60px] rtl:-left-[10px] -right-[10px] ` : ""
          }
        >
          <InventoryVoucherToolbar />
        </div>
      </div>

      <div
        className={`${
          !match ? "h-[calc(100dvh-140px)] overflow-y-auto" : "h-full"
        } flex flex-col gap-3 p-2`}
      >
        {/* <MainInfoSection data={[inboundData, outboundData, neutralData]} /> */}
        <MainInfoSection data={[inboundData, outboundData]} />
      </div>
    </>
    // </div>
  );
}
