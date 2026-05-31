"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Tooltip,
  ReferenceLine,
} from "recharts";

interface IMicroData {
  value: number;
}

const LineChartNetProfit = ({ data }: { data: IMicroData[] }) => {
  return (
    <div className="w-full h-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
        >
          <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="3 3" />

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-gray-200 px-2 py-1 rounded shadow-sm text-xs">
                    {Number(payload[0].value).toLocaleString("fa-IR")}
                  </div>
                );
              }
              return null;
            }}
          />

          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartNetProfit;
