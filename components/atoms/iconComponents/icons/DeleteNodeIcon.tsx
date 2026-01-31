import type { IIconConfig } from "../type";

export const DeleteNodeIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "28"}
      viewBox="0 0 28 28"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width={config?.width ? `${config.width}` : "28"}
        rx="4"
        className={
          !config?.fill ? "stroke-gray-gray2  dark:stroke-gray-gray1" : ""
        }
        fill={config?.fill}
      />
      <path
        d="M22.5001 8H5.5"
        className={
          !config?.stroke
            ? "stroke-state-error1  dark:stroke-state-error1 "
            : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20.8346 10.5L20.3747 17.3991C20.1977 20.054 20.1092 21.3815 19.2442 22.1907C18.3792 23 17.0488 23 14.388 23H13.6146C10.9538 23 9.62342 23 8.75841 22.1907C7.8934 21.3815 7.8049 20.054 7.62791 17.3991L7.16797 10.5"
        className={
          !config?.stroke
            ? "stroke-state-error1  dark:stroke-state-error1 "
            : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.5 8C8.55588 8 8.58382 8 8.60915 7.99936C9.43259 7.97849 10.159 7.45491 10.4392 6.68032C10.4478 6.65649 10.4567 6.62999 10.4743 6.57697L10.5714 6.28571C10.6543 6.03708 10.6957 5.91276 10.7507 5.8072C10.97 5.38607 11.3757 5.09364 11.8446 5.01877C11.9621 5 12.0932 5 12.3553 5H15.6447C15.9068 5 16.0379 5 16.1554 5.01877C16.6243 5.09364 17.03 5.38607 17.2493 5.8072C17.3043 5.91276 17.3457 6.03708 17.4286 6.28571L17.5257 6.57697C17.5433 6.62992 17.5522 6.65651 17.5608 6.68032C17.841 7.45491 18.5674 7.97849 19.3909 7.99936C19.4162 8 19.4441 8 19.5 8"
        className={
          !config?.stroke
            ? "stroke-state-error1  dark:stroke-state-error1 "
            : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
    </svg>
  );
};
