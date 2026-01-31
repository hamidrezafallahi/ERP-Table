import type { IIconConfig } from '../type';

export const ArrowCircleUpLeft = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "28"}
      height={config?.height ? `${config.height}` : "28"}
      viewBox="0 0 28 28"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 3.5C19.799 3.5 24.5 8.20101 24.5 14C24.5 19.799 19.799 24.5 14 24.5C8.20101 24.5 3.5 19.799 3.5 14C3.5 8.20101 8.20101 3.5 14 3.5Z"
        className={!config?.fill ? "fill-white dark:fill-gray-gray1" : ""}
        fill={config?.fill}
      />
      <path
        d="M15.1667 10.5H10.5M10.5 10.5V15.1667M10.5 10.5L17.5 17.5M24.5 14C24.5 8.20101 19.799 3.5 14 3.5C8.20101 3.5 3.5 8.20101 3.5 14C3.5 19.799 8.20101 24.5 14 24.5C19.799 24.5 24.5 19.799 24.5 14Z"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
