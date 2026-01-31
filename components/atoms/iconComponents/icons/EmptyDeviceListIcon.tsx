import type { IIconConfig } from "../type";

export const EmptyDeviceListIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width="151"
      height="151"
      viewBox="0 0 151 151"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M25.166 94.375V44.0417C25.166 32.178 25.166 26.2461 28.8516 22.5606C32.5372 18.875 38.469 18.875 50.3327 18.875H69.2077M125.833 94.375V91.2292"
        className={
          !config?.stroke ? "stroke-gray-gray6  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M113.251 12.582C125.114 12.582 131.046 12.582 134.732 16.2676C138.417 19.9532 138.417 25.885 138.417 37.7487V50.332C138.417 62.1957 138.417 68.1275 134.732 71.8131C131.046 75.4987 125.114 75.4987 113.251 75.4987C101.387 75.4987 95.4551 75.4987 91.7696 71.8131C88.084 68.1275 88.084 62.1957 88.084 50.332L88.084 37.7487C88.084 25.885 88.084 19.9532 91.7696 16.2676C95.4551 12.582 101.387 12.582 113.251 12.582Z"
        className={
          !config?.stroke ? "stroke-gray-gray6  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M113.25 56.625H113.307"
        className={
          !config?.stroke ? "stroke-gray-gray6  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22.0065 100.764L25.2902 94.375H125.531L128.994 100.764C138.072 117.509 140.334 125.882 136.883 132.149C133.432 138.417 124.284 138.417 105.986 138.417L45.0151 138.417C26.7177 138.417 17.569 138.417 14.1183 132.149C10.6677 125.882 12.9284 117.509 22.0065 100.764Z"
        className={
          !config?.stroke ? "stroke-gray-gray6  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="143"
        y1="9.82843"
        x2="10.8284"
        y2="142"
        className={
          !config?.stroke ? "stroke-gray-gray7  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
};
