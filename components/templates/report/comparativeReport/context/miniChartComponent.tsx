import React from 'react';

import {
  Area,
  AreaChart,
} from 'recharts';

export default function MiniChartComponent({ record }) {
  console.log("Record received:", record);
  const rawData = record["Periods"] ?? [];
  const data = rawData.map((item, index) => ({
    id: index + 1,
    Time: item.Time,
    Value: item.Value?? index,
  }));
  return (
    <AreaChart
      width={100}
      height={40}
      data={data}
     >
      <defs>
        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1976d2" stopOpacity={0.8} />
          <stop offset="100%" stopColor="#1976d2" stopOpacity={0} />
        </linearGradient>
      </defs>

 
      <Area
        type="bump"
        dataKey="Value"
        stroke="#1976d2"
        strokeWidth={1}
        fill="url(#colorUv)"
        activeDot={{
          stroke: "#1976d2",
          strokeWidth: 2,
          fill: "#1976d2",
        }}
      />
    </AreaChart>
  );
}
