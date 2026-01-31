import React from 'react';

import {
  NegativeIcon,
  PositiveIcon,
} from '@components/atoms/iconComponents';

interface StatCardProps {
  title: string;
  todayCount: number;
  totalCount: number;
  percentage: number;
}

export default function StatCard({
  title,
  todayCount,
  totalCount,
  percentage,
}: StatCardProps) {
  const isPositive = percentage >= 0;

  return (
    <div className="flex flex-col justify-around w-full h-full">
      <div className="flex justify-between items-center">
        <div className="font-normal text-gray-gray7 text-sm">{title}</div>
        <div
          className={`text-sm font-bold flex items-center gap-1 ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? <PositiveIcon /> : <NegativeIcon />}
          {percentage.toFixed(2)}% {isPositive ? "+" : "-"}
        </div>
      </div>
      <div className="flex lg:flex-col justify-between gap-14 lg:gap-y-4 w-full">
        <div className="flex justify-between items-center w-full text-gray-600 text-sm">
          <div className="font-bold text-2xs text-gray-gray9">تعداد امروز</div>
          <div className="font-bold text-black text-lg">{todayCount}</div>
        </div>

        <div className="flex justify-between items-center w-full text-gray-600 text-sm">
          <div className="font-bold text-2xs text-gray-gray9">تعداد کل</div>
          <div className="font-bold text-black text-lg">{totalCount}</div>
        </div>
      </div>
    </div>
  );
}
