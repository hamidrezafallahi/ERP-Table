import React from 'react';

import { sampleData } from '../type';

export default function HistoryTable({ data }: { data: typeof sampleData }) {
  return (
    <div className="hidden md:block min-w-[720px]">
      {data.map((user, i) => (
        <div
          key={user.id}
          className={`grid grid-cols-5 items-center px-4 h-14 rounded ${
            i % 2 === 0 ? "bg-gray-gray4" : "bg-white"
          }`}
        >
          <div className="font-medium text-gray-gray10 text-sm text-center">
            {i + 1}
          </div>
          <div className="font-medium text-gray-gray10 text-sm text-center whitespace-nowrap">
            {user.nameOrAccount}
          </div>
          <div className="font-medium text-gray-gray10 text-sm text-center">
            {user.date}
          </div>
          <div className="font-medium text-gray-gray10 text-sm text-center">
            {user.time}
          </div>
          <div className="font-medium text-sm text-center">
            <span
              className={
                user.status === "عدم تایید"
                  ? "text-state-error1"
                  : "text-gray-gray10 "
              }
            >
              {user.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
