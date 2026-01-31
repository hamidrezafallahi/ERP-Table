import type { IIconConfig } from '../type';

export const CircleConnectionIcon = ({ config }: { config?: IIconConfig }) => {
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
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        d="M10.5 12C10.5 11.2929 10.5 10.9393 10.7197 10.7197C10.9393 10.5 11.2929 10.5 12 10.5C12.7071 10.5 13.0607 10.5 13.2803 10.7197C13.5 10.9393 13.5 11.2929 13.5 12C13.5 12.7071 13.5 13.0607 13.2803 13.2803C13.0607 13.5 12.7071 13.5 12 13.5C11.2929 13.5 10.9393 13.5 10.7197 13.2803C10.5 13.0607 10.5 12.7071 10.5 12Z"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        d="M4.5 7.5C4.5 6.79289 4.5 6.43934 4.71967 6.21967C4.93934 6 5.29289 6 6 6C6.70711 6 7.06066 6 7.28033 6.21967C7.5 6.43934 7.5 6.79289 7.5 7.5C7.5 8.20711 7.5 8.56066 7.28033 8.78033C7.06066 9 6.70711 9 6 9C5.29289 9 4.93934 9 4.71967 8.78033C4.5 8.56066 4.5 8.20711 4.5 7.5Z"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        d="M7.5 7.5H9C10.4142 7.5 11.1213 7.5 11.5607 7.93934C12 8.37868 12 9.08579 12 10.5"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 9V14M6 6V4"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
