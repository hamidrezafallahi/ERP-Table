import type { IIconConfig } from '../type';

export const LeftParenthesisIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "24"}
      height={config?.height ? `${config.height}` : "24"}
      viewBox="0 0 24 24"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 3C11.589 4.93486 10 8.24345 10 12C10 15.7565 11.589 19.0651 14 21"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
