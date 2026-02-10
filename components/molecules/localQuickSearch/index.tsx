import { memo, useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";
import { useDispatch } from "react-redux";

import InputText from "@components/atoms/defaultElements/inputText";
import { CloseCircle, Magnifier } from "@components/atoms/iconComponents";

function InputSearch({ quickSearch, setQuickSearch, setPageNumber }) {
  const t = useTranslations();
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState(quickSearch || "");
  const prevViewDataRef = useRef(quickSearch);

  useEffect(() => {
    if (quickSearch) {
      setSearchTerm(quickSearch || "");
    }
  }, [quickSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (prevViewDataRef.current !== searchTerm) {
        setQuickSearch(searchTerm);
        setPageNumber(1);
      }
    }, 500);

    prevViewDataRef.current = quickSearch;

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, dispatch, quickSearch]);

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
      className={`lg:!bg-gray-gray5 !bg-white flex items-center  rounded w-full text-xs`}
      onChange={handleSearchChange}
      // onFocus={onFocus}
      // onBlur={onBlur}
    />
  );
}

export const LocalQuickSearch = memo(InputSearch);
