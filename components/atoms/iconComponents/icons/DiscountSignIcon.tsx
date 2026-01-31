import type { IIconConfig } from '../type';

export const DiscountSignIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "40"}
      height={config?.height ? `${config.height}` : "40"}
      viewBox="0 0 40 40"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.2417 4.16602C10.8134 4.26727 8.22679 4.69028 6.45951 6.45756C4.69223 8.22484 4.26922 10.8114 4.16797 15.2398M24.7609 4.16602C29.1892 4.26727 31.7758 4.69028 33.5431 6.45756C35.3104 8.22484 35.7334 10.8114 35.8346 15.2398M24.7609 35.8327C29.1892 35.7314 31.7758 35.3084 33.5431 33.5411C35.3104 31.7739 35.7334 29.1873 35.8346 24.7589M15.2417 35.8327C10.8134 35.7314 8.22679 35.3084 6.45951 33.5411C4.69223 31.7739 4.26922 29.1873 4.16797 24.7589"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3356 13.332H13.3506"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26.6676 26.666H26.6826"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.3359 26.6654L26.6693 13.332"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
