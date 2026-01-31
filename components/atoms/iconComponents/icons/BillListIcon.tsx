import type { IIconConfig } from '../type';

export const BillListIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "19"}
      viewBox="0 0 18 19"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.5662 2H5.43376C4.56461 2 4.13003 2 3.77954 2.12196C3.11491 2.35322 2.59311 2.89039 2.36847 3.5746C2.25 3.93541 2.25 4.38279 2.25 5.27755V15.7806C2.25 16.4243 2.98875 16.7658 3.45607 16.3382C3.73063 16.087 4.14437 16.087 4.41893 16.3382L4.78125 16.6698C5.26244 17.1101 5.98756 17.1101 6.46875 16.6698C6.94994 16.2294 7.67506 16.2294 8.15625 16.6698C8.63744 17.1101 9.36256 17.1101 9.84375 16.6698C10.3249 16.2294 11.0501 16.2294 11.5312 16.6698C12.0124 17.1101 12.7376 17.1101 13.2188 16.6698L13.5811 16.3382C13.8556 16.087 14.2694 16.087 14.5439 16.3382C15.0113 16.7658 15.75 16.4243 15.75 15.7806V5.27755C15.75 4.38279 15.75 3.93541 15.6315 3.5746C15.4069 2.89039 14.8851 2.35322 14.2205 2.12196C13.87 2 13.4354 2 12.5662 2Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M7.875 8.75L12.75 8.75"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5.25 8.75H5.625"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5.25 6.125H5.625"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M5.25 11.375H5.625"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.875 6.125H12.75"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.875 11.375H12.75"
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
