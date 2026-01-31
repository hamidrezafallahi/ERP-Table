import React from 'react';

import type { IIconConfig } from '../type';

export const DownChevron = ({
  config,
  inheritStyle = false,
  rotate = 0,
  style,
}: {
  config?: IIconConfig;
  inheritStyle?: boolean;
  rotate?: number;
  style?: React.CSSProperties;
}) => {
  const commonProps = {
    xmlns: "http://www.w3.org/2000/svg",
    width: config?.width ? `${config.width}` : "24",
    height: config?.height ? `${config.height}` : "24",
    viewBox: "0 0 24 24",
    fill: config?.fill ? `${config.fill}` : "none",
    style: {
      transform: `rotate(${rotate}deg)`,
      transition: "transform 0.3s ease",
      ...style,
    },
  };
  if (inheritStyle) {
    return (
      <svg
        {...commonProps}
        style={{
          color: "inherit",
          transform: `rotate(${rotate}deg)`,
          transition: "transform 0.3s ease",
        }}
        xmlns="http://www.w3.org/2000/svg"
        width={config?.width ? `${config.width}` : "24"}
        height={config?.height ? `${config.height}` : "24"}
        viewBox="0 0 24 24"
        fill={config?.fill ? `${config.fill}` : "none"}
      >
        <path
          d="M16 10L12 14L8 10"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  } else {
    return (
      <svg
        {...commonProps}
        xmlns="http://www.w3.org/2000/svg"
        width={config?.width ? `${config.width}` : "24"}
        height={config?.height ? `${config.height}` : "24"}
        viewBox="0 0 24 24"
        fill={config?.fill ? `${config.fill}` : "none"}
      >
        <path
          d="M16 10L12 14L8 10"
          className={
            !config?.stroke && "stroke-gray-gray10  dark:stroke-gray-gray1"
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
};
