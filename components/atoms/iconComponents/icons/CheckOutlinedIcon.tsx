import type { IIconConfig } from '../type';

export const CheckOutlinedIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "16"}
      height={config?.height ? `${config.height}` : "13"}
      viewBox="0 0 16 13"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 8.29102C1 8.29102 2.5 8.29102 4.5 11.4993C4.5 11.4993 10.0588 3.09657 15 1.41602"
        className={
          !config?.stroke ? "stroke-gray-gray9  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
