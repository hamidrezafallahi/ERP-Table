import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import InputText from "@components/atoms/defaultElements/inputText";
import { Magnifier } from "@components/atoms/iconComponents";

interface DebounceSearchProps {
  setSearch?: (e: any) => void;
}

export const DebounceSearch = ({ setSearch }: DebounceSearchProps) => {
  const t = useTranslations();
  const [inputValue, setInputValue] = useState<string>();
  const debounceTimeoutRef = useRef(null);

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const onClearSearchInput = () => {
    setInputValue("");
  };

  useEffect(() => {
    if (typeof inputValue !== "undefined") {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(async () => {
        setSearch?.(inputValue.trim());
      }, 808);
    }
  }, [inputValue]);

  return (
    <InputText
      allowClear
      onClear={() => onClearSearchInput()}
      className="!bg-main-white lg:!bg-gray-gray5 lg:!h-[2.35rem]"
      prefix={<Magnifier />}
      onChange={handleChangeInput}
      placeholder={t("general.search")}
      value={inputValue}
    />
  );
};
