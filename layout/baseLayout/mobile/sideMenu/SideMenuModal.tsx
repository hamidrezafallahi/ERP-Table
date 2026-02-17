import React from 'react';

import { CashContent } from '@components/molecules/defaultParameterModal/cash';
import {
  CompanyContent,
} from '@components/molecules/defaultParameterModal/company';
import {
  CurrencyContent,
} from '@components/molecules/defaultParameterModal/currency';
import {
  LanguageContent,
} from '@components/molecules/defaultParameterModal/language';
import { YearContent } from '@components/molecules/defaultParameterModal/year';

const SideMenuModal = ({ removeMenuSide }) => {

  const renderContent = () => {
    const components = [
      LanguageContent,
      CurrencyContent,
      YearContent,
      CashContent,
      CompanyContent,
    ];
    return components.map((Component, index) => (
      <Component
        key={index}
        setOpenModal={removeMenuSide}
      />
    ));
  };

  return <>{renderContent()}</>;
};

export default SideMenuModal;
