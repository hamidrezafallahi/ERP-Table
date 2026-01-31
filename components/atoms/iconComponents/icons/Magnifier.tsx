import type { IIconConfig } from '../type';

export const Magnifier = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <g clipPath="url(#clip0_1286_24482)">
        <circle
          cx="8.625"
          cy="8.625"
          r="7.125"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
        />
        <path
          d="M13.875 13.875L16.5 16.5"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1286_24482">
          <rect
            width={config?.width ? `${config.width}` : "18"}
            height={config?.height ? `${config.height}` : "18"}
            fill={config?.fill}
            className={!config?.fill ? "fill-white dark:fill-gray-gray1" : ""}
          />
        </clipPath>
      </defs>
    </svg>
  );
};
