import React from "react";

import { useTranslations } from "next-intl";

import { CustomButton } from "@components/atoms/defaultElements";
import { FormulaIcon } from "@components/atoms/iconComponents";

function FormulaMaker() {
  const t = useTranslations();
  return (
    <CustomButton
      type="text"
      className="!bg-gray-gray3 dark:!bg-gray-gray11 !px-3 !py-0 border-none rounded h-9"
    >
      <FormulaIcon />
      {t("general.formulaMaker")}
    </CustomButton>
  );
}

export default FormulaMaker;
