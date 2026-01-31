import { useState } from 'react';

import { CustomButton } from '@components/atoms/defaultElements';
import {
  Downtrend,
  Update,
  Uptrend,
} from '@components/atoms/iconComponents';
import { useDarkMode } from '@hooks/custom';

export const MainHeaderCard = ({ item }) => {
  const { mode = "light" } = useDarkMode();

  const [loading, setLoading] = useState(false);

  const handleUpdateReport = (id) => {
    setLoading(!loading);
  };
  return (
    <div className="flex flex-col px-4 border border-gray-gray6 rounded-lg w-full h-20">
      <div className="flex justify-between items-center">
        <div className="text-gray-gray9 dark:text-white text-xs">
          {item.label}
        </div>
        <CustomButton
          type="text"
          className={`h-fit !bg-transparent active:!bg-transparent !m-0 !p-2 flex justify-center items-center rounded-full ${
            loading ? "animate-rotate" : ""
          }`}
          onClick={() => {
            handleUpdateReport(item.id);
          }}
        >
          <Update
            config={{
              width: 14,
              height: 14,
              stroke: mode === "dark" ? "#FBFBFB" : "#b1b1b1",
            }}
          />
        </CustomButton>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex">
          <div
            className={`flex items-center  ${
              item.value < 0
                ? "text-state-error1"
                : item.value == 0
                ? "text-gray-gray10"
                : "text-state-success3"
            }`}
          >
            {item.value}
            {item.value < 0 ? (
              <Downtrend />
            ) : item.value == 0 ? null : (
              <Uptrend />
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div className="p-1 text-gray-gray9 dark:!text-white text-sm">
            {item.price?.toLocaleString("fa-IR")}
          </div>
          {/* <div className="text-3xs text-gray-gray7">تومان</div> */}
        </div>
      </div>
    </div>
  );
};
