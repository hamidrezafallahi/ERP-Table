import React from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';

import Title from '@components/atoms/Title';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import {
  IIncreasingAndDecreasingFactors,
} from '@services/sale/increasingAndDecreasingFactors/type';
import { ISelectOption } from '@type/elementType';

import DesktopView from './desktopView';
import MobileView from './mobileView';

export interface IData extends ISelectOption {
  AddElement: IIncreasingAndDecreasingFactors;
}
function CheckoutLayout() {
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);
  const t = useTranslations();

  return (
    <>
      <Title caption={t("general.StoreInvoice")} />
      {match ? <DesktopView /> : <MobileView />}
    </>
  );
}

export default CheckoutLayout;
