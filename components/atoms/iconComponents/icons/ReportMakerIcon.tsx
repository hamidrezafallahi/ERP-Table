import type { IIconConfig } from '../type';

export const ReportMakerIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "32"}
      height={config?.height ? `${config.height}` : "32"}
      viewBox="0 0 32 32"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 20.5L4 26.5"
        className={
          !config?.stroke ? "stroke-[#585858] dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 11.5L16 26.5"
        className={
          !config?.stroke ? "stroke-[#585858] dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M31 31L1 31"
        className={
          !config?.stroke ? "stroke-[#585858] dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 17.5L28 26.5"
        className={
          !config?.stroke ? "stroke-[#585858] dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.40014 11.1999C5.85281 10.4713 4.98144 10 4 10C2.34315 10 1 11.3431 1 13C1 14.6569 2.34315 16 4 16C5.65685 16 7 14.6569 7 13C7 12.3246 6.7768 11.7013 6.40014 11.1999ZM6.40014 11.1999L13.5999 5.80011M13.5999 5.80011C14.1472 6.52871 15.0186 7 16 7C17.1745 7 18.1913 6.32508 18.6839 5.34193M13.5999 5.80011C13.2232 5.29869 13 4.67541 13 4C13 2.34315 14.3431 1 16 1C17.6569 1 19 2.34315 19 4C19 4.48237 18.8862 4.93815 18.6839 5.34193M18.6839 5.34193L25.3161 8.65807M25.3161 8.65807C25.1138 9.06185 25 9.51763 25 10C25 11.6569 26.3431 13 28 13C29.6569 13 31 11.6569 31 10C31 8.34315 29.6569 7 28 7C26.8255 7 25.8087 7.67492 25.3161 8.65807Z"
        className={
          !config?.stroke ? "stroke-[#585858] dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
    </svg>
  );
};
