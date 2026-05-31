"use client";
import React, { useEffect } from 'react';

import { Form } from 'antd';
import { useSearchParams } from 'next/navigation';
import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';
import { addNewPage } from '@slice/pages';
import { PageStateEnum } from '@slice/pages/enum';
import { PageTypeEnum } from '@type/enum';

import InventoryTypesForm from './inventoryTypesForm';
import InventoryTypesToolBar from './inventoryTypesToolBar';

function InventoryTypesTemplate() {
  const dispatch = useDispatch();
  const params = useSearchParams();
  const id = params.get("id");
  const [form] = Form.useForm();
  const { initPage } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
    }),
    shallowEqual
  );
  const { pageId, RepoId, SystemId, url, pageState, originalPageState } =
    initPage;
  const { data: relatedStock, isLoading: relatedStockIsLoading } = useGetData<
    any,
    any
  >({
    url: "api/inv/select/inventory",
    body: {
      InventoryId: id ?? undefined,
    },
  });

  useEffect(() => {
    if (relatedStock?.Result === "Success" && relatedStock.Data?.length > 0) {
      const relatedStocks = relatedStock.Data[0];
      const formData = [
        {
          name: "InventoryDesc",
          type: "string",
          value: relatedStocks.InventoryDesc,
          originalValue: relatedStocks.InventoryDesc,
          isTitleField:true        },
        {
          name: "Rate",
          type: "string",
          value: relatedStocks.Rate,
          originalValue: relatedStocks.Rate,
        },
        {
          name: "StockIds",
          type: "array",
          value: relatedStocks.Stocks.map((s) => ({
            name: s.StockId,
            type: "number",
            value: s.IsChecked,
            caption: s.StockName,
          })),
          originalValue: relatedStocks.Stocks.map((s) => ({
            name: s.StockId,
            type: "number",
            value: s.IsChecked,
            caption: s.StockName,
          })),
        },
        {
          name: "VoucherTypeIds",
          type: "array",
          value: relatedStocks.VoucherTypes.map((vt) => ({
            name: vt.VoucherTypeId,
            type: "number",
            value: vt.IsChecked,
            caption: vt.VoucherTypeDesc,
          })),
          originalValue: relatedStocks.VoucherTypes.map((vt) => ({
            name: vt.VoucherTypeId,
            type: "number",
            value: vt.IsChecked,
            caption: vt.VoucherTypeDesc,
          })),
        },
      ];

      dispatch(
        addNewPage({
          pageId: pageId,
          caption: "title.inventoryTypes",
          icon: "InventoryTypeIcon",
          type: PageTypeEnum.Custom,
          RepoId: RepoId,
          pageState: pageState ? pageState : PageStateEnum.Opened,
          originalPageState: originalPageState
            ? originalPageState
            : PageStateEnum.Opened,
          pageData: formData,

          SystemId: SystemId,
          url: url,
          listUrl: "inv/inventoryTypeList",
        })
      );
    }
  }, [relatedStock]);

  return (
    <div className="relative w-full h-full">
      <InventoryTypesToolBar form={form} />
      <InventoryTypesForm
        form={form}
        relatedStockIsLoading={relatedStockIsLoading}
      />
    </div>
  );
}

export default InventoryTypesTemplate;
