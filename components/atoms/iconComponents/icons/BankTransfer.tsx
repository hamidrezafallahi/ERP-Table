import type { IIconConfig } from '../type';

export const BankTransfer = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_8699_53642)">
        <path
          d="M9.99935 1.66602L10.3348 0.995195C10.1236 0.889622 9.87508 0.889622 9.66394 0.995195L9.99935 1.66602ZM1.66602 8.33268H0.916016V9.08268H1.66602V8.33268ZM18.3327 8.33268V9.08268H19.0827V8.33268H18.3327ZM18.3327 5.83268H19.0827C19.0827 5.5486 18.9222 5.28891 18.6681 5.16186L18.3327 5.83268ZM1.66602 5.83268L1.33061 5.16186C1.07652 5.28891 0.916016 5.5486 0.916016 5.83268H1.66602ZM18.3327 7.58268H1.66602V9.08268H18.3327V7.58268ZM2.00143 6.5035L10.3348 2.33684L9.66394 0.995195L1.33061 5.16186L2.00143 6.5035ZM9.66394 2.33684L17.9973 6.5035L18.6681 5.16186L10.3348 0.995195L9.66394 2.33684ZM2.41602 8.33268V5.83268H0.916016V8.33268H2.41602ZM17.5827 5.83268V8.33268H19.0827V5.83268H17.5827Z"
          className={
            !config?.fill ? "fill-gray-gray10  dark:fill-gray-gray1" : ""
          }
          fill={config?.fill}
        />
        <path
          d="M9.99593 5.83203H10.0034"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="2"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
        <path
          d="M3.33203 8.33203V15.4154M6.66536 8.33203V15.4154"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
        <path
          d="M13.332 8.33203V15.4154M16.6654 8.33203V15.4154"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
        <path
          d="M18.3327 15.416H1.66602V18.3327H18.3324L18.3327 15.416Z"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinecap="square"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_8699_53642">
          <rect
            width={config?.width ? `${config.width}` : "20"}
            height={config?.height ? `${config.height}` : "20"}
            className={!config?.fill ? "fill-white  dark:fill-gray-gray1" : ""}
            fill={config?.fill}
          />
        </clipPath>
      </defs>
    </svg>
  );
};
