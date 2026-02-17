"use client";
import { useState } from "react";

import Form from "@components/templates/form";
import { useAppSelector } from "@redux/index";
import {
  type IPerson,
  type IRequest,
  PersonTypeEnum,
} from "@services/com/person/type";

export default function PersonFormPage({
  isModal = false,
  parentPageId = null,
}) {
  const activePageData = useAppSelector((state) =>
    state.withPersist.pages.find((item) => item.isActive)
  );

  const [conditionalFields, setConditionalFields] = useState<any[] | boolean>(
    true
  );
  const isCompanyChangeHandler = (pageData) => {
    const personType = activePageData?.pageData?.find(
      (item) => item.name === "PersonType"
    )?.value;

    const isPerson =
      personType === PersonTypeEnum.Person ||
      personType === PersonTypeEnum.Foreign;

    const isForeign = personType === PersonTypeEnum.Foreign;
    const isOnlyPerson = personType === PersonTypeEnum.Person;

    const newPageData = pageData
      ?.filter((item) => {
        const name = item.name;

        if (personType !== PersonTypeEnum.Company && name === "EconomicCode") {
          return false;
        }

        if (
          personType === PersonTypeEnum.Company &&
          ["LastName", "PassportNumber"].includes(name)
        ) {
          return false;
        }

        if (!isPerson && ["BirthDate", "Sex"].includes(name)) {
          return false;
        }

        if (!isForeign && name === "ForeignLocationId") {
          return false;
        }

        if (isForeign && name === "IsCivicParticipation") {
          return false;
        }

        if (!isOnlyPerson && name === "BirthLocationId") {
          return false;
        }

        return true;
      })
      ?.map((item) => {
        if (item.name === "FirstName") {
          return {
            ...item,
            caption: personType === PersonTypeEnum.Company ? "نام شرکت" : "نام",
          };
        }
        if (item.name === "NationalCode") {
          return {
            ...item,
            caption:
              personType === PersonTypeEnum.Company
                ? "شناسه شرکت"
                : personType === PersonTypeEnum.Foreign
                ? "کد فراگیر"
                : "کد ملی",
          };
        }

        return item;
      });

    setConditionalFields(newPageData);
  };

  return (
    <Form<IPerson, IRequest>
      fieldKey="PersonId"
      caption={"title.person"}
      url="/api/com/select/person"
      listUrl="com/personList"
      titleKey="DisplayName"
      pageIcon="PersonPageIcon"
      isModal={isModal}
      parentPageId={parentPageId}
      conditionalFields={conditionalFields}
      setConditionalFields={setConditionalFields}
      extraFunction={isCompanyChangeHandler}
      withImage
    />
  );
}
