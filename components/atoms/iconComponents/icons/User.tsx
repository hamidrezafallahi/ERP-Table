import type { IIconConfig } from '../type';

export const User = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "28"}
      height={config?.height ? `${config.height}` : "28"}
      viewBox="0 0 30 30"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M25 26.25C25 22.7982 20.5228 20 15 20C9.47715 20 5 22.7982 5 26.25M15 16.25C11.5482 16.25 8.75 13.4518 8.75 10C8.75 6.54822 11.5482 3.75 15 3.75C18.4518 3.75 21.25 6.54822 21.25 10C21.25 13.4518 18.4518 16.25 15 16.25Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
