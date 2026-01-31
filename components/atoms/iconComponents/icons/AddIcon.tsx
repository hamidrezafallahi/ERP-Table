import type { IIconConfig } from '../type';

export const AddIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "21"}
      height={config?.height ? `${config.height}` : "21"}
      viewBox="0 0 21 21"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.5 3.5V17.5"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 10.5H17.5"
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
