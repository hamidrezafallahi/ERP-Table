import React from "react";

import type { IIconConfig } from "../type";

export const JobTypeIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.25 10.25V19.25M15.25 10.25V19.25"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.25 10.25H19.25"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M0.75 12C0.75 8.34661 0.75 6.51992 1.86299 5.38496C2.97599 4.25 4.76733 4.25 8.35 4.25H12.15C15.7327 4.25 17.524 4.25 18.637 5.38496C19.75 6.51992 19.75 8.34661 19.75 12C19.75 15.6534 19.75 17.4801 18.637 18.615C17.524 19.75 15.7327 19.75 12.15 19.75H8.35C4.76733 19.75 2.97599 19.75 1.86299 18.615C0.75 17.4801 0.75 15.6534 0.75 12Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14.75 4.25L14.6507 3.94094C14.1556 2.40089 13.9081 1.63087 13.3189 1.19043C12.7296 0.75 11.947 0.75 10.3816 0.75H10.1184C8.55304 0.75 7.77036 0.75 7.18111 1.19043C6.59186 1.63087 6.34436 2.40089 5.84934 3.94094L5.75 4.25"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
    </svg>
  );
};
