"use client";
import { useState } from "react";

import Form from "@components/templates/form";
import { useAppSelector } from "@redux/index";
import type {
  IIncreasingAndDecreasingFactors,
  IRequest,
} from "@services/sale/increasingAndDecreasingFactors/type";

export default function IncreasingAndDecreasingFactorsFormPage() {
  const activePageData = useAppSelector((state) =>
    state.withPersist.pages.find((item) => item.isActive)
  );

  const elementTypeValue = activePageData?.pageData?.find(
    (item) => item.name === "ElementType"
  )?.value;

  const pricePercentValue = activePageData?.pageData?.find(
    (item) => item.name === "PricePercent"
  )?.value;

  const [conditionalFields, setConditionalFields] = useState<any[] | boolean>(
    true
  );
  const elementTypeChangeHandler = (pageData) => {
    const newPageData = pageData
      ?.filter(
        (item) =>
          !(
            elementTypeValue === 2 &&
            ["Taxable", "Discountable"].includes(item.name)
          ) && !(pricePercentValue === true && item.name === "PriceCurrencyId")
      )
      ?.map((item) => {
        if (item.name === "BaseValue") {
          return {
            ...item,
            caption: pricePercentValue === true ? "درصد" : "مبلغ",
          };
        }
        return item;
      });

    setConditionalFields(newPageData);
  };
  return (
    <Form<IIncreasingAndDecreasingFactors, IRequest>
      fieldKey="AddElementId"
      caption={"title.increasingAndDecreasingFactors"}
      url="/api/sale/select/AddElement"
      listUrl="sale/increasingAndDecreasingFactorsList"
      titleKey="AddElementDesc"
      pageIcon="IncreasingAndDecreasingFactorsIcon"
      conditionalFields={conditionalFields}
      setConditionalFields={setConditionalFields}
      extraFunction={elementTypeChangeHandler}
    />
  );
}
