import React, { useState } from 'react';

import { shallowEqual } from 'react-redux';

import {
  DownOutlined,
  UpOutlined,
} from '@ant-design/icons';
import { useAppSelector } from '@redux/index';

import { TransferItem } from '../type';
import { useTranslations } from 'next-intl';

export default function TransferHistory({ data }: { data: TransferItem[] }) {
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  },shallowEqual);
const t =useTranslations();
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenItemId((prevId) => (prevId === id ? null : id));
  };

  return (
    <div role="row">
      <h3 className="mt-14 mb-4 pt-4 border-gray-gray10 border-t font-bold text-gray-gray12 text-md dark:text-white text-center">
   {t("general.transferRecords")}
      </h3>

      <div className="hidden items-center md:grid grid-cols-5 bg-white dark:bg-gray-gray11 mb-2 px-4 py-3 border border-gray-gray3 rounded-lg min-w-[720px] h-14">
        <div className="text-gray-gray10 dark:text-gray-gray1 text-xs text-center">
          {t("general.row")}
        </div>
        <div className="text-gray-gray10 dark:text-gray-gray1 text-xs text-center">
        {t("general.name/AccountID")}
        </div>
        <div className="text-gray-gray10 dark:text-gray-gray1 text-xs text-center">
        {t("general.date")}
        </div>
        <div className="text-gray-gray10 dark:text-gray-gray1 text-xs text-center">
        {t("general.time")}
        </div>
        <div className="text-gray-gray10 dark:text-gray-gray1 text-xs text-center">
        {t("general.status")}
        </div>
      </div>

      {!match ? (
        <div className="space-y-2 mb-14">
          {data.map((user, i) => {
            const isOpen = openItemId === user.id;
            return (
              <div
                key={user.id}
                className={`bg-white dark:bg-gray-gray11 rounded-lg  items-center shadow-sm border px-3 py-2  ${
                  i % 2 === 0
                    ? "bg-gray-50 dark:bg-gray-gray9"
                    : "bg-white dark:bg-gray-gray11"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className={`    flex items-center gap-3`}>
                    <div className="text-gray-gray10 dark:text-gray-gray1 text-sm">
                      {i + 1}
                    </div>
                    <div
                      className={` ${
                        user.status === "عدم تایید"
                          ? "text-state-error1 "
                          : "text-gray-gray10 dark:text-gray-gray1  "
                      }      font-medium text-sm`}
                    >
                      {user.nameOrAccount}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleItem(user.id)}
                    className="flex items-center gap-1 sm:gap-2 mt-1 font-medium text-gray-gray10 dark:text-gray-gray1 text-xs"
                  >
                    {isOpen ? <UpOutlined /> : <DownOutlined />}
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-2 text-gray-gray10 dark:text-gray-gray1 text-xs truncate">
                    <div className="flex justify-between items-center mb-2 text-gray-600 dark:text-gray-gray1 text-sm">
                      <div>{user.date}</div>
                      <div>{user.time}</div>
                    </div>

                    <div className="flex items-center">
                      <div
                        className={
                          user.status === "عدم تایید"
                            ? "text-state-error1 font-medium"
                            : "text-gray-gray10 dark:text-gray-gray1  font-medium"
                        }
                      >
                        {user.status}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="hidden md:block min-w-[720px]">
          {data.map((user, i) => (
            <div
              key={user.id}
              className={`grid grid-cols-5 items-center px-4 h-14 rounded ${
                i % 2 === 0
                  ? "bg-gray-gray4 dark:bg-gray-gray11"
                  : "bg-white dark:bg-gray-gray9"
              }`}
            >
              <div className="font-medium text-gray-gray10 dark:text-gray-gray1 text-sm text-center">
                {i + 1}
              </div>
              <div className="font-medium text-gray-gray10 dark:text-gray-gray1 text-sm text-center whitespace-nowrap">
                {user.nameOrAccount}
              </div>
              <div className="font-medium text-gray-gray10 dark:text-gray-gray1 text-sm text-center">
                {user.date}
              </div>
              <div className="font-medium text-gray-gray10 dark:text-gray-gray1 text-sm text-center">
                {user.time}
              </div>
              <div className="font-medium text-sm text-center">
                <span
                  className={
                    user.status === "عدم تایید"
                      ? "text-state-error1"
                      : "text-gray-gray10 dark:text-gray-gray1 "
                  }
                >
                  {user.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
