import type { IIconConfig } from '../type';

export const LinkHorizontal = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "26"}
      height={config?.height ? `${config.height}` : "14"}
      viewBox="0 0 26 14"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.66667 7.00002H18.3333M17 1.66669H19.6667C22.6122 1.66669 25 4.0545 25 7.00002C25 9.94554 22.6122 12.3334 19.6667 12.3334H17M9 1.66669H6.33333C3.38781 1.66669 1 4.0545 1 7.00002C1 9.94554 3.38781 12.3334 6.33333 12.3334H9"
        className={
          !config?.stroke ? "stroke-gray-gray7  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
