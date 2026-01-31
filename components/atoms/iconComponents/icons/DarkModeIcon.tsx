import type { IIconConfig } from '../type';

export const DarkModeIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "24"}
      height={config?.height ? `${config.height}` : "24"}
      viewBox="0 0 24 24"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.5 14.5784C20.3003 15.2189 18.9301 15.5821 17.4751 15.5821C12.7491 15.5821 8.91792 11.7509 8.91792 7.02485C8.91792 5.56986 9.28105 4.19968 9.92163 3C5.66765 3.99698 2.5 7.81513 2.5 12.3731C2.5 17.6899 6.8101 22 12.1269 22C16.6849 22 20.503 18.8324 21.5 14.5784Z"
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
