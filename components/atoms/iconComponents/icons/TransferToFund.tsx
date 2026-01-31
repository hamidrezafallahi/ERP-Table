import type { IIconConfig } from '../type';

export const TransferToFund = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_8658_53364)">
        <path
          opacity="0.5"
          d="M1.66602 9.99935C1.66602 6.07098 1.66602 4.10679 2.8864 2.8864C4.10679 1.66602 6.07098 1.66602 9.99935 1.66602C13.9277 1.66602 15.8919 1.66602 17.1123 2.8864C18.3327 4.10679 18.3327 6.07098 18.3327 9.99935"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
        />
        <path
          d="M1.66602 11.6667C1.66602 9.33311 1.66602 8.16634 2.12016 7.27504C2.51963 6.49103 3.15705 5.85361 3.94106 5.45414C4.83235 5 5.99913 5 8.33268 5H11.666C13.9996 5 15.1663 5 16.0576 5.45414C16.8417 5.85361 17.4791 6.49103 17.8785 7.27504C18.3327 8.16634 18.3327 9.33311 18.3327 11.6667C18.3327 14.0002 18.3327 15.167 17.8785 16.0583C17.4791 16.8423 16.8417 17.4797 16.0576 17.8792C15.1663 18.3333 13.9996 18.3333 11.666 18.3333H8.33268C5.99913 18.3333 4.83235 18.3333 3.94106 17.8792C3.15705 17.4797 2.51963 16.8423 2.12016 16.0583C1.66602 15.167 1.66602 14.0002 1.66602 11.6667Z"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
        />
        <path
          d="M9.99935 14.166L9.99935 9.16602M9.99935 9.16602L12.0827 11.2493M9.99935 9.16602L7.91602 11.2493"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_8658_53364">
          <rect
            width={config?.width ? `${config.width}` : "20"}
            height={config?.height ? `${config.height}` : "20"}
            rx="5"
            fill={config?.fill}
            className={!config?.fill ? "fill-white dark:fill-gray-gray1" : ""}
          />
        </clipPath>
      </defs>
    </svg>
  );
};
