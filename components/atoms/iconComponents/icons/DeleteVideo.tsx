import type { IIconConfig } from '../type';

export const DeleteVideo = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "34"}
      height={config?.height ? `${config.height}` : "34"}
      viewBox="0 0 34 34"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="17"
        cy="17"
        r="16.5"
        fillOpacity="0.2"
        className="fill-gray-gray8 dark:fill-gray-gray1 stroke-gray-gray7 dark:stroke-gray-gray1"
      />
      <path
        d="M26.2078 10.5H7.79102"
        stroke={config?.stroke ? config.stroke : "#DC3545"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M24.4032 13.2083L23.9049 20.6823C23.7132 23.5584 23.6173 24.9965 22.6802 25.8732C21.7431 26.7499 20.3019 26.7499 17.4193 26.7499H16.5815C13.699 26.7499 12.2577 26.7499 11.3206 25.8732C10.3835 24.9965 10.2877 23.5584 10.0959 20.6823L9.59766 13.2083"
        stroke={config?.stroke ? config.stroke : "#DC3545"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M11.041 10.5C11.1016 10.5 11.1318 10.5 11.1593 10.4993C12.0513 10.4767 12.8383 9.90948 13.1418 9.07035C13.1512 9.04453 13.1607 9.01582 13.1799 8.95839L13.2851 8.64286C13.3748 8.3735 13.4197 8.23882 13.4793 8.12447C13.7169 7.66824 14.1564 7.35144 14.6643 7.27033C14.7917 7.25 14.9336 7.25 15.2175 7.25H18.7811C19.0651 7.25 19.207 7.25 19.3344 7.27033C19.8423 7.35144 20.2818 7.66824 20.5194 8.12447C20.579 8.23882 20.6238 8.3735 20.7136 8.64286L20.8188 8.95839C20.8379 9.01574 20.8475 9.04455 20.8569 9.07035C21.1604 9.90948 21.9474 10.4767 22.8394 10.4993C22.8669 10.5 22.8971 10.5 22.9577 10.5"
        stroke={config?.stroke ? config.stroke : "#DC3545"}
        strokeWidth="1.5"
      />
    </svg>
  );
};
