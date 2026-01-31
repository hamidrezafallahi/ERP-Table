import type { IIconConfig } from '../type';

export const MenuAlt = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "16"}
      height={config?.height ? `${config.height}` : "14"}
      viewBox="0 0 11 8"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.833008 7.33366H6.16634M0.833008 4.00033H10.1663M4.83301 0.666992H10.1663"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
