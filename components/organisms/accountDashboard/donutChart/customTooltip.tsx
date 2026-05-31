import React from "react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: readonly any[];
}

const CustomTooltip = (props: CustomTooltipProps) => {
  const { active, payload } = props;
  if (!active || !payload || !payload.length) return null;
  console.log({payload});
  console.log({active});
  

  const data = payload[0];
  return (
    <div className="bg-white shadow-xl rounded-xl px-4 py-3 border border-gray-100 flex flex-col gap-1">
      <span className="text-sm text-gray-500">{data.name}</span>
      <div className="flex items-center gap-2">
        <span
          className="w-3 h-3 rounded-full"
          style={{ background: payload[0]?.color }}
        />
        <span className="text-sm font-bold text-gray-900">
          {data.value.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default CustomTooltip;
