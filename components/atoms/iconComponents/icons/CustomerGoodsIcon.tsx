import type { IIconConfig } from '../type';

export const CustomerGoodsIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 16.5C8.38636 16.5 7.80014 16.2485 6.6277 15.7454C3.70923 14.4932 2.25 13.8671 2.25 12.814L2.25 5.81063M9 16.5C9.61364 16.5 10.1999 16.2485 11.3723 15.7454C14.2908 14.4932 15.75 13.8671 15.75 12.814L15.75 5.81063M9 16.5L9 9.12802M15.75 5.81063C15.75 6.26344 15.1488 6.54937 13.9465 7.12125L11.7556 8.16331C10.4034 8.80645 9.72728 9.12802 9 9.12802M15.75 5.81063C15.75 5.35782 15.1488 5.07188 13.9465 4.5M2.25 5.81063C2.25 6.26344 2.85118 6.54937 4.05354 7.12125L6.24444 8.16331C7.59663 8.80645 8.27272 9.12802 9 9.12802M2.25 5.81063C2.25 5.35782 2.85118 5.07188 4.05354 4.5M4.74902 9.98328L6.24444 10.6945"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 1.5V3M12 2.25L10.875 3.75M6 2.25L7.125 3.75"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
};
