import type { IIconConfig } from '../type';

export const BookMark = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "16"}
      height={config?.height ? `${config.height}` : "16"}
      viewBox="0 0 16 16"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M14 10.7273V7.39833C14 4.53925 14 3.10971 13.1213 2.22151C12.2426 1.33331 10.8284 1.33331 8 1.33331C5.17157 1.33331 3.75736 1.33331 2.87868 2.22151C2 3.10971 2 4.53925 2 7.39833V10.7273C2 12.7916 2 13.8238 2.4894 14.2748C2.72281 14.49 3.01743 14.6251 3.33128 14.661C3.98935 14.7363 4.75782 14.0566 6.29477 12.6972C6.97415 12.0963 7.31383 11.7959 7.70685 11.7167C7.90038 11.6777 8.09962 11.6777 8.29315 11.7167C8.68617 11.7959 9.02585 12.0963 9.70523 12.6972C11.2422 14.0566 12.0107 14.7363 12.6687 14.661C12.9826 14.6251 13.2772 14.49 13.5106 14.2748C14 13.8238 14 12.7916 14 10.7273Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        opacity="0.5"
        d="M10 4H6"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
    </svg>
  );
};
