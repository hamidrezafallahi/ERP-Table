import type { IIconConfig } from '../type';

export const CashDepositIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "24"}
      height={config?.height ? `${config.height}` : "25"}
      viewBox="0 0 24 25"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 7.31781C10.483 4.46424 12.9665 2.29102 15.9575 2.29102C19.2947 2.29102 22 4.99633 22 8.33351C22 11.3246 19.8268 13.808 16.9732 14.291"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 22.291C11.3137 22.291 14 19.6047 14 16.291C14 12.9773 11.3137 10.291 8 10.291C4.68629 10.291 2 12.9773 2 16.291C2 19.6047 4.68629 22.291 8 22.291Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M2 8.29102C2 5.52673 4.23571 3.29102 7 3.29102V5.29102"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M22 16.291C22 19.0553 19.7643 21.291 17 21.291V19.291"
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
