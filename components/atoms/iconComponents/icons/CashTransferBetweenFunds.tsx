import type { IIconConfig } from '../type';

export const CashTransferBetweenFunds = ({
  config,
}: {
  config?: IIconConfig;
}) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_8714_54233)">
        <path
          d="M8.33203 5.85501C8.73453 3.47704 10.8041 1.66602 13.2966 1.66602C16.0776 1.66602 18.332 3.92045 18.332 6.70143C18.332 9.19397 16.521 11.2635 14.143 11.666"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M6.66602 18.332C9.42744 18.332 11.666 16.0935 11.666 13.332C11.666 10.5706 9.42744 8.33203 6.66602 8.33203C3.90459 8.33203 1.66602 10.5706 1.66602 13.332C1.66602 16.0935 3.90459 18.332 6.66602 18.332Z"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M1.66602 6.66667C1.66602 4.3631 3.52911 2.5 5.83268 2.5V4.16667"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M18.332 13.3333C18.332 15.6369 16.4689 17.5 14.1654 17.5V15.8333"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_8714_54233">
          <rect
            width={config?.width ? `${config.width}` : "20"}
            height={config?.height ? `${config.height}` : "20"}
            className={!config?.fill ? "fill-white dark:fill-gray-gray1" : ""}
            fill={config?.fill}
          />
        </clipPath>
      </defs>
    </svg>
  );
};
