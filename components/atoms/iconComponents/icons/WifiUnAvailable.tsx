import type { IIconConfig } from "../type";

export const WifiUnAvailable = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "210"}
      height={config?.height ? `${config.height}` : "210"}
      viewBox="0 0 210 210"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M156.193 101.011C149.166 93.4755 140.561 87.5839 130.994 83.7573M181.789 77.1422C171.248 65.8383 158.342 57.0009 143.991 51.261C129.64 45.5211 114.2 43.0181 98.771 43.9347M72.9995 127.667C78.3627 121.915 85.1769 117.716 92.7252 115.51C100.274 113.305 108.277 113.168 115.893 115.127M53.8076 101.009C62.1058 92.1099 72.5803 85.5279 84.1979 81.9116M28.207 77.1403C36.0634 68.7154 45.2525 61.6408 55.4062 56.2M38.6233 35L162.367 158.744M105 166.25C100.168 166.25 96.2502 162.332 96.2502 157.5C96.2502 152.668 100.168 148.75 105 148.75C109.833 148.75 113.75 152.668 113.75 157.5C113.75 162.332 109.833 166.25 105 166.25Z"
        className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
