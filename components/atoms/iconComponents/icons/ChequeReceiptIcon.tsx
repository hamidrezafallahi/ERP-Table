import type { IIconConfig } from '../type';

export const ChequeReceiptIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "25"}
      height={config?.height ? `${config.height}` : "25"}
      viewBox="0 0 25 25"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        opacity="0.5"
        d="M2.5 12.4023C2.5 7.6883 2.5 5.33128 3.96447 3.86681C5.42893 2.40234 7.78595 2.40234 12.5 2.40234C17.214 2.40234 19.5711 2.40234 21.0355 3.86681C22.5 5.33128 22.5 7.6883 22.5 12.4023"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M2.5 14.4023C2.5 11.6021 2.5 10.2019 3.04497 9.13239C3.52433 8.19158 4.28924 7.42668 5.23005 6.94731C6.29961 6.40234 7.69974 6.40234 10.5 6.40234H14.5C17.3003 6.40234 18.7004 6.40234 19.77 6.94731C20.7108 7.42668 21.4757 8.19158 21.955 9.13239C22.5 10.2019 22.5 11.6021 22.5 14.4023C22.5 17.2026 22.5 18.6027 21.955 19.6723C21.4757 20.6131 20.7108 21.378 19.77 21.8574C18.7004 22.4023 17.3003 22.4023 14.5 22.4023H10.5C7.69974 22.4023 6.29961 22.4023 5.23005 21.8574C4.28924 21.378 3.52433 20.6131 3.04497 19.6723C2.5 18.6027 2.5 17.2026 2.5 14.4023Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M10 14.8023L11.4286 16.4023L15 12.4023"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
