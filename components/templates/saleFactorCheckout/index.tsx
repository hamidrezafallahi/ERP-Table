"use client";
import React, { useEffect } from 'react';

import {
  shallowEqual,
  useDispatch,
} from 'react-redux';

import { useAppSelector } from '@redux/index';
import { addNewPage } from '@slice/pages';
import { PageTypeEnum } from '@type/enum';

import CheckoutLayout from './layout';

export function SaleFactorCheckout() {
  const { initPage } = useAppSelector(
    (state) => ({
      initPage: state.withPersist.init,
    }),
    shallowEqual
  );
  const { pageId, RepoId, SystemId, pageState, originalPageState } = initPage;
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(
      addNewPage({
        pageId: pageId,
        caption: "general.StoreInvoice",
        icon: "SalesInvoiceIcon",
        pageState: pageState,
        originalPageState: originalPageState,
        type: PageTypeEnum.Custom,
        RepoId: RepoId,
        SystemId: SystemId,
        url: "sale/checkoutInvoice",
      })
    );
  }, []);

  return <CheckoutLayout />;
}