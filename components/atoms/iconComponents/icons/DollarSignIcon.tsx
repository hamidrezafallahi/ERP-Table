import type { IIconConfig } from '../type';

export const DollarSignIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "40"}
      height={config?.height ? `${config.height}` : "40"}
      viewBox="0 0 40 40"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="19.9987"
        cy="20.0007"
        r="16.6667"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
      />
      <path
        d="M20 28.334V29.1673V30.0007"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20 10V10.8333V11.6667"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M25 15.8327C25 13.5315 22.7614 11.666 20 11.666C17.2386 11.666 15 13.5315 15 15.8327C15 18.1339 17.2386 19.9993 20 19.9993C22.7614 19.9993 25 21.8648 25 24.166C25 26.4672 22.7614 28.3327 20 28.3327C17.2386 28.3327 15 26.4672 15 24.166"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
