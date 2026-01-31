import { useEffect, useRef, useState } from "react";

import { useTranslations } from "next-intl";

import InputText from "@components/atoms/defaultElements/inputText";
import { Magnifier } from "@components/atoms/iconComponents";

interface IProps {
  setSearch?: (e: any) => void;
}
export const DebounceSearch = ({ ...props }: IProps) => {
  const t = useTranslations();
  const { setSearch } = props;
  const [inputValue, setInputValue] = useState<string>();
  const debounceTimeoutRef = useRef(null);
  const handleChangeInput = (e) => {
    setInputValue(e.target.value.trim());
  };
  const onClearSearchInput = () => {
    setInputValue("");
  };

  useEffect(() => {
    if (typeof inputValue !== "undefined") {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(async () => {
        setSearch?.(inputValue);
      }, 808);
    }
  }, [inputValue]);

  return (
    <InputText
      allowClear
      onClear={() => onClearSearchInput()}
      className="!bg-main-white lg:!bg-gray-gray5"
      prefix={<Magnifier />}
      onChange={handleChangeInput}
      placeholder={t("general.search")}
      value={inputValue}
    />
  );
};
