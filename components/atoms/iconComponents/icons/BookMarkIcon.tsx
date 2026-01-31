import type { IIconConfig } from '../type';

export const BookMarkIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "16"}
      height={config?.height ? `${config.height}` : "16"}
      viewBox="0 0 16 16"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 10.7272V7.39826C14 4.53919 14 3.10965 13.1213 2.22145C12.2426 1.33325 10.8284 1.33325 8 1.33325C5.17157 1.33325 3.75736 1.33325 2.87868 2.22145C2 3.10965 2 4.53919 2 7.39826V10.7272C2 12.7916 2 13.8238 2.4894 14.2748C2.72281 14.4899 3.01743 14.625 3.33128 14.6609C3.98935 14.7362 4.75782 14.0565 6.29477 12.6971C6.97415 12.0962 7.31383 11.7958 7.70685 11.7166C7.90038 11.6776 8.09962 11.6776 8.29315 11.7166C8.68617 11.7958 9.02585 12.0962 9.70523 12.6971C11.2422 14.0565 12.0107 14.7362 12.6687 14.6609C12.9826 14.625 13.2772 14.4899 13.5106 14.2748C14 13.8238 14 12.7916 14 10.7272Z"
        className={
          !config?.stroke ? "stroke-gray-gray85  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        opacity="0.5"
        d="M10 4H6"
        className={
          !config?.stroke ? "stroke-gray-gray85  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
    </svg>
  );
};
