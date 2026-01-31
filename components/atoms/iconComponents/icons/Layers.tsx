import type { IIconConfig } from '../type';

export const Layers = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "31"}
      height={config?.height ? `${config.height}` : "31"}
      viewBox="0 0 30 30"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M26.25 15L15 22.5L3.75 15M26.25 20L15 27.5L3.75 20M26.25 10L15 17.5L3.75 10L15 2.5L26.25 10Z"
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
