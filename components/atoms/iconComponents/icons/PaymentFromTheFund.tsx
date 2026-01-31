import type { IIconConfig } from '../type';

export const PaymentFromTheFund = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.5833 12.5H5.41667C4.56295 12.5 4.13609 12.5 3.7955 12.6282C3.25647 12.8311 2.83106 13.2565 2.62819 13.7955C2.5 14.1361 2.5 14.5629 2.5 15.4167C2.5 16.2704 2.5 16.6972 2.62819 17.0378C2.83106 17.5769 3.25647 18.0023 3.7955 18.2051C4.13609 18.3333 4.56295 18.3333 5.41667 18.3333H14.5833C15.4371 18.3333 15.8639 18.3333 16.2045 18.2051C16.7435 18.0023 17.1689 17.5769 17.3718 17.0378C17.5 16.6972 17.5 16.2704 17.5 15.4167C17.5 14.5629 17.5 14.1361 17.3718 13.7955C17.1689 13.2565 16.7435 12.8311 16.2045 12.6282C15.8639 12.5 15.4371 12.5 14.5833 12.5Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M15.8327 12.5L15.3947 8.55827C15.2067 6.86575 15.1126 6.01949 14.5431 5.50974C13.9736 5 13.1221 5 11.4192 5H8.57952C6.87658 5 6.02511 5 5.45559 5.50974C4.88607 6.01949 4.79204 6.86575 4.60399 8.55827L4.16602 12.5"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M9.16602 1.66602H11.666M14.166 1.66602H11.666M11.666 1.66602V4.99935"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 15.416H12.5"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6.66602 7.91602H9.16602"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};
