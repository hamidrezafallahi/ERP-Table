import type { IIconConfig } from '../type';

export const RowInfoIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_10629_119215)">
        <path
          opacity="0.5"
          d="M1.5 9C1.5 5.46447 1.5 3.6967 2.59835 2.59835C3.6967 1.5 5.46447 1.5 9 1.5C12.5355 1.5 14.3033 1.5 15.4017 2.59835C16.5 3.6967 16.5 5.46447 16.5 9"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
        />
        <path
          d="M1.5 10.5C1.5 8.3998 1.5 7.3497 1.90873 6.54754C2.26825 5.84193 2.84193 5.26825 3.54754 4.90873C4.3497 4.5 5.3998 4.5 7.5 4.5H10.5C12.6002 4.5 13.6503 4.5 14.4525 4.90873C15.1581 5.26825 15.7317 5.84193 16.0913 6.54754C16.5 7.3497 16.5 8.3998 16.5 10.5C16.5 12.6002 16.5 13.6503 16.0913 14.4525C15.7317 15.1581 15.1581 15.7317 14.4525 16.0913C13.6503 16.5 12.6002 16.5 10.5 16.5H7.5C5.3998 16.5 4.3497 16.5 3.54754 16.0913C2.84193 15.7317 2.26825 15.1581 1.90873 14.4525C1.5 13.6503 1.5 12.6002 1.5 10.5Z"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
        />
        <path
          d="M7.125 10.8L8.19643 12L10.875 9"
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
        <clipPath id="clip0_10629_119215">
          <rect
            width={config?.width ? `${config.width}` : "18"}
            height={config?.height ? `${config.height}` : "18"}
            rx="5"
            className={!config?.fill ? "fill-white  dark:fill-gray-gray1" : ""}
            fill={config?.fill}
          />
        </clipPath>
      </defs>
    </svg>
  );
};
