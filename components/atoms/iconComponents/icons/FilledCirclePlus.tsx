import type { IIconConfig } from '../type';

export const FilledCirclePlus = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="9"
        cy="9"
        r="8.5"
        stroke={config?.stroke}
        fill={config?.fill}
        className={
          !config?.stroke && !config?.fill
            ? "fill-main-black dark:fill-gray-gray1 stroke-gray-gray8 dark:stroke-gray-gray1"
            : ""
        }
      />
      <path
        d="M8.99999 12.5L9 8.79373M9 8.79373C9 8.79373 8.99999 5.49998 8.99997 5.26664M9 8.79373L12.7333 8.79373M9 8.79373L5.26666 8.79373"
        className={!config?.stroke ? "stroke-white dark:stroke-gray-gray1" : ""}
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
