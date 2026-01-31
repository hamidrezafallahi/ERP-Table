import type { IIconConfig } from '../type';

export const LicenseIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "19"}
      viewBox="0 0 18 19"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.39706 2C12.3919 2 13.8893 2 14.8196 2.87868C15.75 3.75736 15.75 5.17157 15.75 8V11C15.75 13.8284 15.75 15.2426 14.8196 16.1213C13.8893 17 12.3919 17 9.39706 17H8.60294C5.60814 17 4.11073 17 3.18037 16.1213C2.25 15.2426 2.25 13.8284 2.25 11L2.25 8C2.25 5.17157 2.25 3.75736 3.18037 2.87868C4.11073 2 5.60814 2 8.60294 2L9.39706 2Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 5.75H12"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 9.5H12"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 13.25L9 13.25"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
