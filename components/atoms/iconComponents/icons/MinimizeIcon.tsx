import type { IIconConfig } from '../type';

export const MinimizeIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.9166 10.0003C17.9166 13.7323 17.9166 15.5983 16.7573 16.7576C15.5979 17.917 13.7319 17.917 9.99996 17.917C6.26801 17.917 4.40203 17.917 3.24266 16.7576C2.08329 15.5983 2.08329 13.7323 2.08329 10.0003C2.08329 6.26837 2.08329 4.4024 3.24266 3.24303C4.40203 2.08366 6.26801 2.08366 9.99996 2.08366C13.7319 2.08366 15.5979 2.08366 16.7573 3.24303C17.9166 4.4024 17.9166 6.26837 17.9166 10.0003Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M9.02778 13.333L7.32425 11.571C6.60808 10.8303 6.25 10.4599 6.25 9.99967C6.25 9.53944 6.60808 9.16907 7.32425 8.42833L9.02778 6.66634M13.75 13.333L12.0465 11.571C11.3303 10.8303 10.9722 10.4599 10.9722 9.99967C10.9722 9.53944 11.3303 9.16907 12.0465 8.42833L13.75 6.66634"
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
