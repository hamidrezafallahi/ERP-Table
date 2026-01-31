import type { IIconConfig } from '../type';

export const TransferToBank = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.3327 9.16602V4.97149C18.3327 3.76493 18.3327 3.16165 17.8562 2.60141C17.3798 2.04117 16.9087 1.96452 15.9665 1.81122C15.4356 1.72483 14.8302 1.66602 14.166 1.66602C12.5685 1.66602 11.1098 1.98071 9.99935 2.49935C8.8889 3.01799 7.43024 3.33268 5.83268 3.33268V3.33268C4.15068 3.33268 3.30968 3.33268 2.97528 3.45575C2.2859 3.70945 2.04278 3.95257 1.78908 4.64194C1.66602 4.97635 1.66602 5.57748 1.66602 6.77975V12.2912C1.66602 13.6791 1.66602 14.373 2.15229 14.9361C2.63857 15.4992 3.18082 15.5791 4.26532 15.7388C4.90303 15.8327 5.40364 15.8327 5.83268 15.8327C6.72095 15.8327 7.56628 15.7354 8.33268 15.5599"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12.0827 8.74935C12.0827 9.89994 11.1499 10.8327 9.99935 10.8327C8.84876 10.8327 7.91602 9.89994 7.91602 8.74935C7.91602 7.59876 8.84876 6.66602 9.99935 6.66602C11.1499 6.66602 12.0827 7.59876 12.0827 8.74935Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M4.58203 9.58203L4.58203 9.58952"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path
        d="M15.416 7.91016L15.416 7.91764"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
      <path
        d="M16.1105 11.666V11.666C16.4699 12.027 16.2142 12.6424 15.7048 12.6424H14.0641C12.7397 12.6424 11.666 13.6977 11.666 14.9993C11.666 15.1415 11.6788 15.2808 11.7034 15.416M13.8882 18.3327V18.3327C13.5288 17.9717 13.7845 17.3563 14.2939 17.3563H15.9346C17.259 17.3563 18.3327 16.301 18.3327 14.9993C18.3327 14.8572 18.3199 14.7179 18.2953 14.5827"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
};
