import type { IIconConfig } from '../type';

export const Media = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "36"}
      height={config?.height ? `${config.height}` : "36"}
      viewBox="0 0 36 36"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 18C3 10.9289 3 7.3934 5.1967 5.1967C7.3934 3 10.9289 3 18 3C25.0711 3 28.6066 3 30.8033 5.1967C33 7.3934 33 10.9289 33 18C33 25.0711 33 28.6066 30.8033 30.8033C28.6066 33 25.0711 33 18 33C10.9289 33 7.3934 33 5.1967 30.8033C3 28.6066 3 25.0711 3 18Z"
        className={
          !config?.stroke ? "stroke-gray-gray7  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
      />
      <path
        opacity="0.5"
        d="M32.25 12H3.75M10.5 12L15.75 3.75M20.25 12L25.5 3.75"
        className={
          !config?.stroke ? "stroke-gray-gray7  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        opacity="0.5"
        d="M22.5 21.75C22.5 20.8 21.507 20.1592 19.5209 18.8778C17.5078 17.5789 16.5012 16.9294 15.7506 17.4063C15 17.8831 15 19.1721 15 21.75C15 24.3279 15 25.6169 15.7506 26.0937C16.5012 26.5706 17.5078 25.9211 19.5209 24.6222C21.507 23.3408 22.5 22.7 22.5 21.75Z"
        className={
          !config?.stroke ? "stroke-gray-gray7  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
