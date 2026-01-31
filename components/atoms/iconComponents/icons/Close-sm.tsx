import type { IIconConfig } from '../type';

export const CloseSm = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "10"}
      height={config?.height ? `${config.height}` : "10"}
      viewBox="0 0 10 10"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.33364 8.3334L5.00033 5.00009M5.00033 5.00009L1.66699 1.66675M5.00033 5.00009L8.33368 1.66675M5.00033 5.00009L1.66699 8.33343"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
