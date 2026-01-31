import type { IIconConfig } from '../type';

export const PaymentDocuments = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_8705_87171)">
        <path
          d="M11.8154 18.3327L18.3314 17.4102L16.582 4.16602L4.99805 5.80598L6.06712 13.8996M11.8154 18.3327L6.06712 13.8996M11.8154 18.3327L11.1351 13.1822L6.06712 13.8996"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M14.1649 4.16717L14.1644 1.66602L1.66602 1.67844V15.8329H8.3508"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_8705_87171">
          <rect
            width={config?.width ? `${config.width}` : "20"}
            height={config?.height ? `${config.height}` : "20"}
            fill={config?.fill}
            className={!config?.fill ? "fill-white dark:fill-gray-gray4" : ""}
          />
        </clipPath>
      </defs>
    </svg>
  );
};
