"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  MoreVertical,
  NegativeIcon,
  PositiveIcon,
} from '@components/atoms/iconComponents';

const daysOfWeek = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
];
const generateRandomData = (
  days = 30,
  min = 200_000_000,
  max = 2_000_000_000
) => {
  const data = [];
  for (let i = 0; i < 30; i++) {
    data.push({
      key: i + 1,
      name: `${daysOfWeek[i % 7]}`, // مثلا "چهارشنبه 10"
      price:
        Math.floor(Math.random() * (2_000_000_000 - 200_000_000 + 1)) +
        200_000_000,
    });
  }
  return data;
};
const data = generateRandomData();
const formatNumber = (val: number) => {
  let num: number;
  let suffix: string;
  if (val >= 1_000_000_000) {
    num = val / 1_000_000_000;
    suffix = " میلیارد";
  } else if (val >= 500_000_000) {
    return "500 میلیون"; // مقدار ثابت
  } else if (val >= 1_000_000) {
    num = val / 1_000_000;
    suffix = " میلیون";
  } else if (val >= 1_000) {
    num = val / 1_000;
    suffix = " هزار";
  } else {
    return val.toString();
  }
  // اگر اعشار صفر بود، حذف می‌کنیم
  const formatted = num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
  return formatted + suffix;
};
interface TooltipProps {
  active?: boolean; // آیا موس روی نقطه است یا نه
  payload?: Array<{
    // داده‌های مربوط به نقطه
    name?: string;
    value?: number;
    [key: string]: any;
  }>;
  label?: string | number; // مقدار XAxis آن نقطه
  [key: string]: any; // سایر props داخلی
}
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #ccc",
          padding: "6px 10px",
          borderRadius: "8px",
          fontSize: "13px",
        }}
      >
        <p style={{ margin: 0 }}>{label}</p>
        <p style={{ margin: 0, color: "#1976d2", fontWeight: "bold" }}>
          {formatNumber(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};
const CustomXAxisTick = ({
  x,
  y,
  payload,
}: {
  x: number;
  y: number;
  payload: { value: string };
}) => {
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16} // فاصله از محور
        textAnchor="end"
        fill="#666"
        fontSize={10} // اندازه کوچک
        transform="rotate(-45)" // زاویه
      >
        {data.find((d) => d.key === payload.value)?.name}
      </text>
    </g>
  );
};
const DashboardChart = () => {
  const percentage = Math.random() * 20 - 10;
  const isPositive = percentage >= 0;
  return (
    <div className="px-2">
      <div className="flex justify-between items-center">
        <h4 className="flex items-center h-full font-medium text-lg">
          <MoreVertical />
          روند فروش
        </h4>
        <span className="flex font-medium text-lg">1,027</span>
      </div>
      <div className="flex justify-between items-center ps-4 pb-1 border-gray-gray5 border-b w-full lg:h-12 font-medium text-gray-gray9 text-xs">
        <p>به نسبت مبالغ فاکتور و زمان</p>
        <div
          className={`text-sm font-bold flex items-center gap-1 ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? <PositiveIcon /> : <NegativeIcon />}
          {percentage.toFixed(2)}% {isPositive ? "+" : "-"}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={270}>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1976d2" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#1976d2" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="8 8" horizontal={false} />
          <XAxis
            dataKey="key"
            axisLine={false}
            tickLine={false}
            //  tick={CustomXAxisTick} // اینجا کامپوننت سفارشی
            type="number"
            domain={[1, data.length]}
            reversed={true}
            tick={({ x, y, payload }) => {
              const day = data.find((d) => d.key === payload.value)?.name;
              return (
                <g transform={`translate(${x},${y})`}>
                  <text
                    x={0}
                    y={0}
                    dy={16}
                    textAnchor="end"
                    fill="#666"
                    fontSize={10}
                    transform="rotate(-45)"
                  >
                    {day}
                  </text>
                </g>
              );
            }}
          />

          <Tooltip content={<CustomTooltip />} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={formatNumber}
            ticks={[500_000_000, 1_000_000_000, 1_500_000_000, 2_000_000_000]}
            tick={{ fontSize: 12 }}
            tickMargin={40}
            tickSize={10}
            orientation="right"
          />
          <Area
            type="bump"
            dataKey="price"
            stroke="#1976d2"
            strokeWidth={3}
            fill="url(#colorUv)"
            activeDot={{
              stroke: "#1976d2",
              strokeWidth: 2,
              fill: "#1976d2",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
export default DashboardChart;
