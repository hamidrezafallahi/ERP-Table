import type { IIconConfig } from '../type';

export const TickIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "13"}
      height={config?.height ? `${config.height}` : "10"}
      viewBox="0 0 13 10"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1 5.00041L4.53553 8.53594L11.6058 1.46484"
        className={
          !config?.stroke ? "stroke-gray-gray95  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
