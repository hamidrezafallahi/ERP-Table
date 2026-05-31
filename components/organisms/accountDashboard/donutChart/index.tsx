"use client";

import './donutChart.css';

import React from 'react';

import { useTranslations } from 'next-intl';
import { shallowEqual } from 'react-redux';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

import EmptyChartIcon
  from '@components/atoms/iconComponents/icons/EmptyChartIcon';
import { useAppSelector } from '@hooks/custom/useAppSelector';
import { useGetData } from '@services/base';

const statusColors: Record<string, string> = {
  "تنظیم شده": "#60A5FA", // آبی
  "تایید شده": "#34D399", // سبز
  "ابطال شده": "#F87171", // قرمز
  "پیش نویس": "#FBBF24", // زرد
  "در حال پردازش": "#F472B6", // صورتی
};

const defaultColor = "#CBD5E1";
const RADIAN = Math.PI / 180;

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-white shadow-sm p-2 border rounded text-sm">
        <p className="font-semibold">{name}</p>
        <p>{`تعداد: ${value}`}</p>
      </div>
    );
  }
  return null;
};

const renderLabelLine = (props: any) => {
  const { cx, cy, midAngle, outerRadius, value, fill } = props;

  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);

  const startX = cx + outerRadius * cos;
  const startY = cy + outerRadius * sin;

  const midX = cx + (outerRadius + 17) * cos;
  const midY = cy + (outerRadius + 17) * sin;

  const endX = midX + (cos >= 0 ? 1 : -1) * 25;
  const endY = midY;

  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <path
        d={`M${startX},${startY}L${midX},${midY}L${endX},${endY}`}
        stroke={fill}
        strokeWidth={1.6}
        fill="none"
      />
      <circle cx={endX} cy={endY} r={3.2} fill={fill} />
      <text
        x={endX + (cos >= 0 ? 20 : -20)}
        y={endY + 1}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fontSize={14}
        fontWeight={600}
        fill={fill}
      >
        {Number(value).toLocaleString("fa-IR")}
      </text>
    </g>
  );
};

const DonutChart = () => {
  const { viewData } = useAppSelector(
    (state) => ({
      viewData: state.withPersist.pages?.find((item) => item.isActive)
        ?.viewData,
    }),
    shallowEqual,
  );
  const t = useTranslations();
  const { data: dataDocStatus } = useGetData({
    url: "/api/acc/select/DocStatusCount",
    body: { StartDate: viewData?.StartDate, EndDate: viewData?.EndDate },
    skip: false,
  });

  const chartData =
    dataDocStatus?.Data?.[0]?.DocStatusCount?.map((item: any) => ({
      name: item.StatusName,
      value: item.Count,
    })) || [];

  return (
    <div className="bg-white shadow-md p-4 rounded-2xl w-full md:w-2/3 lg:w-full h-[360px] sm:h-auto lg:h-[360px]">
      <span className="text-lg">{t("general.docStatusCount")}</span>
      {chartData.length ? (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart width={400} height={300}>
            <Pie
              data={chartData}
              cx="50%"
              cy="45%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={4}
              dataKey="value"
              cornerRadius={8}
              label={renderLabelLine}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={statusColors[entry.name] || defaultColor}
                />
              ))}
            </Pie>
            {/* <Tooltip content={<CustomTooltip />} /> */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white shadow-sm px-2 py-1 border border-gray-200 rounded text-xs">
                      {Number(payload[0].value).toLocaleString("fa-IR")}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontSize: "14px",
                paddingTop: "0",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex flex-col justify-center items-center gap-2 h-64">
          <EmptyChartIcon config={{ width: 150, height: 150 }} />
          <p className="text-gray-gray6 text-base">
            داده‌ای برای نمایش وجود ندارد.
          </p>
        </div>
      )}
    </div>
  );
};

export default DonutChart;
