"use client";
import { useState } from 'react';

import { Form } from '@components/templates/form';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import type {
  IInventoryVoucherType,
  IRequest,
} from '@services/inv/inventoryVoucherType/type';

export default function InventoryVoucherTypeFormPage() {
  const activePageData = useAppSelector((state) =>
    state.withPersist.pages?.find((item) => item.isActive)
  );

  const [conditionalFields, setConditionalFields] = useState<any[] | boolean>(
    true
  );
  const hasThirdPartyChangeHandler = (pageData) => {
    const isCompanyValue = activePageData?.pageData?.find(
      (item) => item.name === "HasThirdParty"
    )?.value;
    const isNeedReference = activePageData?.pageData?.find(
      (item) => item.name === "NeedReference"
    )?.value;

    const newPageData = pageData?.filter((item) => {
      if (!isCompanyValue && item.name === "TafsiliTypeId") {
        return false;
      }
      if (!isNeedReference && item.name === "VoucherReference") {
        return false;
      }

      return true;
    });

    setConditionalFields(newPageData);
  };

  return (
    <Form<IInventoryVoucherType, IRequest>
      fieldKey="VoucherTypeId"
      caption={"title.inventoryVoucherType"}
      url="/api/com/select/voucherType/inv"
      listUrl="inv/inventoryVoucherTypeList"
      titleKey="VoucherTypeDesc"
      pageIcon="VoucherTypeIcon"
      mutationSystemId={2}
      conditionalFields={conditionalFields}
      setConditionalFields={setConditionalFields}
      extraFunction={hasThirdPartyChangeHandler}
    />
  );
}
