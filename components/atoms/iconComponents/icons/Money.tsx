import type { IIconConfig } from '../type';

export const Money = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "6"}
      height={config?.height ? `${config.height}` : "12"}
      viewBox="0 0 8 14"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M4 12V12.5V13"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        d="M4 1V1.5V2"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        d="M7 4.5C7 3.11929 5.65685 2 4 2C2.34315 2 1 3.11929 1 4.5C1 5.88071 2.34315 7 4 7C5.65685 7 7 8.11929 7 9.5C7 10.8807 5.65685 12 4 12C2.34315 12 1 10.8807 1 9.5"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
    </svg>
  );
};
