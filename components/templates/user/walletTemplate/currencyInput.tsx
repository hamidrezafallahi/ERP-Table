import React from 'react';

import { useTranslations } from 'next-intl';

interface Props {
  value: number;
  onChange: (value: number) => void;
}

const CurrencyInput: React.FC<Props> = ({ value, onChange }) => {
  const t = useTranslations();
  const formatCurrency = (num: number) =>
    num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    onChange(raw ? Number(raw) : 0);
  };

  return (
    <input
      value={value ? formatCurrency(value) : ""}
      onChange={handleChange}
      placeholder={t("general.amountInput")}
      inputMode="numeric"
      className="dark:bg-inherit font-medium placeholder:font-medium text-gray-gray10 dark:placeholder:text-gray-gray1 dark:text-gray-gray1 placeholder:text-gray-gray10 text-lg placeholder:text-lg text-center"
    />
  );
};

export default CurrencyInput;
