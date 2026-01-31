import { useState } from "react";

import {
  AvailableCurrencies,
  BaseCurrency,
  InvoiceSettlement,
  MeasureUnitConfig,
  SystemSettingSidebar,
} from "@components/molecules/systemSetting";

import { SystemSettingEnum } from "./type";
import { AccountingLevels } from "@components/molecules/systemSetting/accountingLevels";

export const SystemSettings = () => {
  const [active, setActive] = useState<string>(`${SystemSettingEnum.General}`);

  const sidebarHandleChange = (id: string) => {
    setActive(id);
  };

  const renderActive = () => {
    switch (active) {
      case `${SystemSettingEnum.Sales}-1`:
        return <InvoiceSettlement />;
      case `${SystemSettingEnum.General}-3`:
        return <MeasureUnitConfig />;
      case `${SystemSettingEnum.General}-1`:
        return <AvailableCurrencies />;
      case `${SystemSettingEnum.General}-2`:
        return <BaseCurrency />;
      case `${SystemSettingEnum.Accounting}-1`:
        return <AccountingLevels />;
      default:
        return null;
    }
  };

  return (
    <div className="gap-2 grid grid-cols-5 p-2">
      <SystemSettingSidebar
        activeItem={active}
        handleChange={sidebarHandleChange}
      />
      <div className="col-span-4 px-2">{renderActive()}</div>
    </div>
  );
};
