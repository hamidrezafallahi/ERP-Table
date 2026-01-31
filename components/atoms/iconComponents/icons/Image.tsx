import type { IIconConfig } from '../type';

export const Image = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "32"}
      height={config?.height ? `${config.height}` : "32"}
      viewBox="0 0 32 32"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 16C1 8.92893 1 5.3934 3.1967 3.1967C5.3934 1 8.92893 1 16 1C23.0711 1 26.6066 1 28.8033 3.1967C31 5.3934 31 8.92893 31 16C31 23.0711 31 26.6066 28.8033 28.8033C26.6066 31 23.0711 31 16 31C8.92893 31 5.3934 31 3.1967 28.8033C1 26.6066 1 23.0711 1 16Z"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
      />
    </svg>
  );
};
