import type { IIconConfig } from '../type';

export const PriceList = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "24"}
      height={config?.height ? `${config.height}` : "24"}
      viewBox="0 0 24 24"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 17H10M15 16H18M18 16H21M18 16V19M18 16V13M3 12H14M3 7H14"
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
