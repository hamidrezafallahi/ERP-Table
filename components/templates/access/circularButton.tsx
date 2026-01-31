import React, { useEffect, useState } from "react";

import { CustomButton } from "@components/atoms/defaultElements";

import { type IProps, LimitAccessEnum } from "./type";

const CircularButton = ({
  handleChange,
  item,
  preState = 0,
  ...props
}: IProps) => {
  const [clickCount, setClickCount] = useState<LimitAccessEnum>(preState);
  const defaultClassname = `p-0 m-0 border-none !bg-main-white ${props.className}`;
  const handleClick = () => {
    setClickCount((prev) => (prev + 1) % 5);
    handleChange((clickCount + 1) % 5);
  };
  useEffect(() => {
    setClickCount(preState);
  }, [preState]);
  return (
    <CustomButton
      {...props}
      onClick={handleClick}
      className={` ${defaultClassname}`}
    >
      <div className="relative flex flex-row-reverse flex-wrap justify-center items-center rounded-full w-6 h-6 overflow-hidden">
        {[0, 1, 2, 3]
          .sort((a, b) => {
            const order = [0, 1, 3, 2];
            return order.indexOf(a) - order.indexOf(b);
          })
          .map((index) => (
            <div
              key={index}
              className={`w-1/2 h-1/2  ${
                index < clickCount
                  ? "bg-main-black p-[0.1px]"
                  : "bg-gray-gray55"
              } transform origin-bottom-left transition-all duration-300`}
            />
          ))}
      </div>
    </CustomButton>
  );
};

export default CircularButton;
