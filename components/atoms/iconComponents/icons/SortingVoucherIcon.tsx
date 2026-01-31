import type { IIconConfig } from '../type';

export const SortingVoucherIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "24"}
      height={config?.height ? `${config.height}` : "24"}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        d="M20.4874 9.48744C19.9749 10 19.1499 10 17.5 10C15.8501 10 15.0251 10 14.5126 9.48744C14 8.97487 14 8.14992 14 6.5C14 4.85008 14 4.02513 14.5126 3.51256C15.0251 3 15.8501 3 17.5 3C19.1499 3 19.9749 3 20.4874 3.51256C21 4.02513 21 4.85008 21 6.5C21 8.14992 21 8.97487 20.4874 9.48744Z"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        d="M20.4874 20.4874C19.9749 21 19.1499 21 17.5 21C15.8501 21 15.0251 21 14.5126 20.4874C14 19.9749 14 19.1499 14 17.5C14 15.8501 14 15.0251 14.5126 14.5126C15.0251 14 15.8501 14 17.5 14C19.1499 14 19.9749 14 20.4874 14.5126C21 15.0251 21 15.8501 21 17.5C21 19.1499 21 19.9749 20.4874 20.4874Z"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        d="M9 4H3"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        d="M9 15H3"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        d="M9 9H3"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        d="M9 20H3"
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
