import type { IIconConfig } from '../type';

export const AddCircle = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "25"}
      height={config?.height ? `${config.height}` : "25"}
      viewBox="0 0 25 25"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12.5"
        cy="12.5"
        r="12"
        className={
          !config?.stroke && !config?.fill
            ? "fill-scrollbar dark:fill-gray-gray1 stroke-main-black dark:stroke-gray-gray1"
            : ""
        }
        stroke={config?.stroke}
        fill={config?.fill}
      />
      <line
        x1="24"
        y1="12.5"
        y2="12.5"
        className={!config?.stroke ? "stroke-white dark:stroke-gray-gray1" : ""}
        stroke={config?.stroke}
      />
      <line
        x1="12.5"
        y1="1"
        x2="12.5"
        y2="24"
        className={!config?.stroke ? "stroke-white dark:stroke-gray-gray1" : ""}
        stroke={config?.stroke}
      />
    </svg>
  );
};
