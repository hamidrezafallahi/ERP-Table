import type { IIconConfig } from '../type';

export const ListCheck = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "30"}
      height={config?.height ? `${config.height}` : "30"}
      viewBox="0 0 30 30"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M5 21.25H13.75M25 17.5L20 22.5L17.5 20M5 15H18.75M5 8.75H18.75"
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
