import React from 'react';

import { sampleData } from '../type';

export default function HistoryCards({ data }: { data: typeof sampleData }) {
  return (
    <div className="md:hidden space-y-3">
      {data.map((user, i) => (
        <div
          key={user.id}
          className={`bg-white rounded-lg p-3 shadow-sm border ${
            i % 2 === 0 ? "bg-gray-50" : "bg-white"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <div className="font-medium text-gray-gray10 text-sm">
              {user.nameOrAccount}
            </div>
            <div className="text-gray-500 text-sm">ردیف {i + 1}</div>
          </div>

          <div className="flex justify-between items-center mb-2 text-gray-600 text-sm">
            <div>{user.date}</div>
            <div>{user.time}</div>
          </div>

          <div className="flex items-center">
            <div
              className={
                user.status === "عدم تایید"
                  ? "text-state-error1 font-medium"
                  : "text-gray-gray10  font-medium"
              }
            >
              {user.status}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
