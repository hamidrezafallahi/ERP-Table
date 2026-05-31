"use client";

import './gaugeChart.css';

import { shallowEqual } from 'react-redux';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
} from 'recharts';

import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';

import { ProfitMargiResponse } from './types';

export default function GaugeChart() {
  const { viewData } = useAppSelector(
    (state) => ({
      viewData: state.withPersist.pages?.find((item) => item.isActive)
        ?.viewData,
    }),
    shallowEqual,
  );

  const { data: dataProfitMargin } = useGetData<ProfitMargiResponse>({
    url: "/api/acc/select/ProfitMargin",
    body: { StartDate: viewData?.StartDate, EndDate: viewData?.EndDate },
    skip: false,
  });

  const profitValue = dataProfitMargin?.Data?.[0]?.ProfitMargin;
  const current = profitValue != null ? Number(profitValue) : null;
  const currentValue = current != null ? Math.round(current * 100) : 0;

  const data = [
    { value: 30, color: "#F87171" },
    { value: 30, color: "#FBBF24" },
    { value: 40, color: "#34D399" },
  ];

  const value = currentValue;

  const RADIAN = Math.PI / 180;

  const needle = (
    value: number,
    data: any[],
    cx: number,
    cy: number,
    iR: number,
    oR: number,
    color: string,
  ) => {
    const total = data.reduce((acc, v) => acc + v.value, 0);
    const ang = 180 * (1 - value / total);

    const length = (iR + 2 * oR) / 3;
    const sin = Math.sin(-RADIAN * ang);
    const cos = Math.cos(-RADIAN * ang);

    const r = 6;

    const x0 = cx;
    const y0 = cy;

    const xba = x0 + r * sin;
    const yba = y0 - r * cos;

    const xbb = x0 - r * sin;
    const ybb = y0 + r * cos;

    const xp = x0 + length * cos;
    const yp = y0 + length * sin;

    return (
      <>
        <circle cx={x0} cy={y0} r={r} fill={color} />
        <path d={`M${xba} ${yba} L${xbb} ${ybb} L${xp} ${yp} Z`} fill={color} />
      </>
    );
  };

  return (
    <div className="relative flex justify-center place-items-center lg:grid w-full h-[300px]">
      <ResponsiveContainer
        width={400}
        height={300}
        className={"gaugeChartClass"}
      >
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            startAngle={180}
            endAngle={0}
            cx={200}
            cy={165}
            innerRadius={95}
            outerRadius={135}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>

          {needle(value, data, 200, 200, 95, 135, "#111827")}
        </PieChart>
      </ResponsiveContainer>

      <div className="bottom-12 absolute text-center">
        <p className="font-bold text-3xl">{value}%</p>
      </div>
    </div>
  );
}
