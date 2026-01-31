import type { IIconConfig } from '../type';

export const ProductCategoryIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11 5L18 5"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 10L14.5 14.5"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 11L5 18"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="6.44444"
        cy="6.44444"
        r="4.44444"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <circle
        cx="5"
        cy="20"
        r="2"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <circle
        cx="16"
        cy="16"
        r="2"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <circle
        cx="20"
        cy="5"
        r="2"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
    </svg>
  );
};
