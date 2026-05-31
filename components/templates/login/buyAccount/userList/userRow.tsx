import React, { useState } from 'react';

import { shallowEqual } from 'react-redux';

import { useAppSelector } from '@hooks/custom/useAppSelector';

export interface User {
  UserId: number;
  FullName: string;
  IsAdmin: boolean;
  PhoneNumber?: string;
}

interface Props {
  user: User;
  index: number;
  onSelect: (user: User) => void;
}

export default function UserRow({ user, index, onSelect }: Props) {
  const [openCurrentMobile, setOpenCurrentMobile] = useState(false);
  const { match } = useAppSelector((state) => {
    const match = state.withPersist.config.initMatch;
    return { match };
  }, shallowEqual);

  return (
    <div role="row" aria-rowindex={index + 1}>
      {!match ? (
        <div
          className={`${
            openCurrentMobile && "flex flex-col items-center gap-3"
          } bg-gray-gray1 dark:bg-gray-gray11
             ${match ? "h-14 px-6" : "px-3 h-9 flex "}
             border border-gray-gray5 rounded w-full my-2 `}
        >
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <p className="text-2xs text-gray-gray10 dark:text-gray-gray1">
                {index + 1}
              </p>
              <p className="font-medium text-gray-gray10 dark:text-gray-gray1 text-sm">
                {user.FullName}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="inline-flex relative items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={user.IsAdmin}
                  onChange={() => onSelect(user)}
                  className="sr-only"
                />
                <div
                  className={`w-12 h-5 bg-white border rounded-full peer peer-focus:ring-4 
                   ${
                     user.IsAdmin ? " border-main-black" : " border-gray-gray6"
                   }`}
                ></div>
                <span
                  className={`absolute left-2 top-0.5 w-4 h-4  rounded-full transition-transform
                  ${
                    user.IsAdmin
                      ? "translate-x-5 bg-main-black"
                      : "translate-x-0 bg-gray-gray6"
                  }`}
                ></span>
              </label>
            </div>
          </div>

          {openCurrentMobile && user.PhoneNumber && (
            <span className="text-gray-gray10 dark:text-gray-gray1 text-xs truncate">
              شماره موبایل: {user.PhoneNumber}
            </span>
          )}
        </div>
      ) : (
        <div className="items-center grid grid-cols-[50px_150px_150px_1fr] bg-gray-gray2 dark:bg-gray-gray11 my-2 px-4 border border-gray-gray11 rounded h-14">
          <span className="inline font-medium text-gray-gray10 dark:text-gray-gray1 text-sm text-center">
            {index + 1}
          </span>
          <span className="inline font-medium text-gray-gray10 dark:text-gray-gray1 text-sm text-center">
            {user.FullName}
          </span>
          <span className="inline font-medium text-gray-gray10 dark:text-gray-gray1 text-sm text-center">
            {user.PhoneNumber || "-"}
          </span>

          <div className="flex justify-center sm:justify-end">
            <label className="inline-flex relative items-center cursor-pointer">
              <input
                type="checkbox"
                checked={user.IsAdmin}
                onChange={() => onSelect(user)}
                className="sr-only"
              />
              <div
                className={`w-12 h-5 bg-white border rounded-full peer peer-focus:ring-4 
                   ${
                     user.IsAdmin ? " border-main-black" : " border-gray-gray6"
                   }`}
              ></div>
              <span
                className={`absolute left-2 top-0.5 w-4 h-4  rounded-full transition-transform
                  ${
                    user.IsAdmin
                      ? "translate-x-5 bg-main-black"
                      : "translate-x-0 bg-gray-gray6"
                  }`}
              ></span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
