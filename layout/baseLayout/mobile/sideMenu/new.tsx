"use client";
import { useState } from 'react';

import { useTranslations } from 'next-intl';

import InputText from '@components/atoms/defaultElements/inputText';
import { useInitializePage } from '@hooks/custom/useInitializePage';
import { flatItems } from '@layout/baseLayout/desktop/topHead/config';

export default function New() {
  const t = useTranslations();
  const initializePage = useInitializePage();
  const [currentAddItems, setCurrentAddItems] = useState(flatItems);
  const [searchPhrase, setSearchPhrase] = useState("");

  const handleFilter = (e) => {
    const search = e.target.value;
    if (search) {
      setSearchPhrase(search);
      const filteredItems = flatItems?.filter((item) =>
        item.name.includes(search)
      );
      setCurrentAddItems(filteredItems);
    } else {
      setSearchPhrase("");
      setCurrentAddItems(flatItems);
    }
  };

  return (
    <div className="flex flex-col gap-2 p-2 h-[80dvh] overflow-auto text-sm">
      <InputText
        autoFocus
        value={searchPhrase}
        placeholder={t("general.search")}
        onChange={handleFilter}
      />
      {currentAddItems?.map((item) => (
        <div
          key={item.name}
          className="bg-gray-gray3 p-2 rounded"
          onClick={() => {
            initializePage({
              config: {
                url: item.url,
                RepoId: item.repoId,
                SystemId: item.systemId,
              },
            });
          }}
        >
          <span>{item.name}</span>
        </div>
      ))}
    </div>
  );
}
