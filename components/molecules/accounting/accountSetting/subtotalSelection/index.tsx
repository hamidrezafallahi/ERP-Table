import {
  useEffect,
  useState,
} from 'react';

import { Checkbox } from 'antd';
import { useTranslations } from 'next-intl';

import InputText from '@components/atoms/defaultElements/inputText';
import {
  CloseCircle,
  Magnifier,
} from '@components/atoms/iconComponents';
import type {
  IAccount,
  IRequest,
} from '@services/acc/account/type';
import { useGetData } from '@services/base';

import type { IProps } from './type';

export const SubtotalSelection = ({
  selectedSubtotal,
  setSelectedSubtotal,
}: IProps) => {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [fullSearch, setFullSearch] = useState("");

  const { data: selection } = useGetData<IAccount[], IRequest>({
    url: "/api/acc/select/account4voucher",

    body: {
      RepoViewId: 10001,
      PagingInfo: {
        PageNumber: 1,
        PageRecordCount: 1000000,
      },
      OrderInfo: [{ Asc: true, ColName: "AccountId" }],
      FullSearchPhrase: fullSearch,
    },
  });
  const allItems = selection?.Data?.map((item) => item.AccountId);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (fullSearch !== searchTerm) {
        setFullSearch(searchTerm);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  return (
    <div className="flex flex-col gap-2">
      <span>{t("general.subtotal")}</span>
      <InputText
        prefix={<Magnifier />}
        defaultValue={searchTerm}
        onClear={() => {
          setFullSearch("");
          setSearchTerm("");
        }}
        placeholder={t("general.search")}
        allowClear={{ clearIcon: <CloseCircle /> }}
        className="flex items-center !bg-gray-gray5 rounded w-full text-xs"
        onChange={(e) => {
          const value = e.target.value;
          setSearchTerm(value);
        }}
      />
      {selection?.Data?.length > 1 && (
        <div className="bg-gray-gray2 p-2 border border-gray-gray5 rounded-lg">
          <Checkbox
            indeterminate={selectedSubtotal.length > 0}
            checked={selectedSubtotal.length === allItems?.length}
            onChange={(e) => {
              const newValue = e.target.checked;

              if (newValue) {
                setSelectedSubtotal(allItems);
              } else {
                setSelectedSubtotal([]);
              }
            }}
          >
            <div className="text-xs text-balance">{t("general.selectAll")}</div>
          </Checkbox>
        </div>
      )}
      <div className="hidden-show-scrollBar flex flex-col gap-2 h-[calc(100dvh-285px)] overflow-y-auto">
        {selection?.Data?.map((item: IAccount) => {
          const defaultSelected = selectedSubtotal.find(
            (el) => el === item.AccountId
          )
            ? true
            : false;
          return (
            <div
              key={item.AccountId}
              className="bg-gray-gray2 p-2 border border-gray-gray5 rounded-lg"
            >
              <Checkbox
                key={item.AccountId}
                checked={defaultSelected}
                onChange={(e) => {
                  const newValue = e.target.checked;
                  if (defaultSelected !== newValue) {
                    if (newValue) {
                      setSelectedSubtotal((prev) => [...prev, item.AccountId]);
                    } else {
                      const newSelectedSubtotal = selectedSubtotal.filter(
                        (el) => el !== item.AccountId
                      );
                      setSelectedSubtotal(newSelectedSubtotal);
                    }
                  }
                }}
              >
                <div className="text-xs text-balance">
                  {item.AccountFullCode} - {item.AccountDesc}
                </div>
              </Checkbox>
            </div>
          );
        })}
      </div>
    </div>
  );
};
