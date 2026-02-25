import type { IIconConfig } from "../type";

export const IssuingProformaInvoiceIcon = ({
  config,
}: {
  config?: IIconConfig;
}) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "24"}
      height={config?.height ? `${config.height}` : "24"}
      viewBox="0 0 19 22"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        d="M9.75 0.75H10.0227C13.2839 0.75 14.9145 0.75 16.0469 1.54784C16.3714 1.77643 16.6594 2.04752 16.9023 2.35289C17.75 3.41867 17.75 4.95336 17.75 8.02273V10.5682C17.75 13.5314 17.75 15.0129 17.2811 16.1962C16.5272 18.0986 14.9329 19.5991 12.9116 20.3086C11.6544 20.75 10.0802 20.75 6.93182 20.75C5.13275 20.75 4.23322 20.75 3.51478 20.4978C2.35979 20.0924 1.44875 19.2349 1.01796 18.1479C0.75 17.4717 0.75 16.6251 0.75 14.9318V10.75"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        d="M17.75 10.75C17.75 12.5909 16.2576 14.0833 14.4167 14.0833C13.7509 14.0833 12.966 13.9667 12.3186 14.1401C11.7435 14.2942 11.2942 14.7435 11.1401 15.3186C10.9667 15.966 11.0833 16.7509 11.0833 17.4167C11.0833 19.2576 9.59095 20.75 7.75 20.75"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        d="M1.75 3.25C2.24153 2.7443 3.54977 0.75 4.25 0.75M6.75 3.25C6.25847 2.7443 4.95023 0.75 4.25 0.75M4.25 0.75L4.25 8.75"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
