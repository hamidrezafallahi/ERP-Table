import { memo, useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import InputText from "@components/atoms/defaultElements/inputText";
import { CloseCircle, Magnifier } from "@components/atoms/iconComponents";

import type { IProps } from "./type";

function InputSearch({ searchPhrase, setSearchPhrase }: IProps) {
  const t = useTranslations();

  const [searchTerm, setSearchTerm] = useState(searchPhrase || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchPhrase !== searchTerm) {
        setSearchPhrase(searchTerm);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleSearchChange = (event) => {
    const { value } = event.target;
    setSearchTerm(value);
  };

  return (
    <InputText
      prefix={<Magnifier />}
      name="FullSearchPhrase"
      value={searchTerm}
      placeholder={t("general.search")}
      allowClear={{ clearIcon: <CloseCircle /> }}
      className="flex items-center !bg-gray-gray5 rounded w-full text-xs"
      onChange={handleSearchChange}
    />
  );
}

export const AccountSettingTreasuryQuickSearch = memo(InputSearch);
