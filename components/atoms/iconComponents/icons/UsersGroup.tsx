import type { IIconConfig } from '../type';

export const UsersGroup = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <circle
        cx="6.75"
        cy="4.5"
        r="3"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        d="M11.25 6.75C12.4926 6.75 13.5 5.74264 13.5 4.5C13.5 3.25736 12.4926 2.25 11.25 2.25"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <ellipse
        cx="6.75"
        cy="12.75"
        rx="5.25"
        ry="3"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        d="M13.5 10.5C14.8157 10.7885 15.75 11.5192 15.75 12.375C15.75 13.147 14.9897 13.8172 13.875 14.1528"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
    </svg>
  );
};
