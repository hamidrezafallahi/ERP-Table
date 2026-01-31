import type { IIconConfig } from '../type';

export const CashWithdrawalIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "25"}
      height={config?.height ? `${config.height}` : "24"}
      viewBox="0 0 25 24"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 15H7C5.59554 15 4.89331 15 4.38886 15.3371C4.17048 15.483 3.98298 15.6705 3.83706 15.8889C3.5 16.3933 3.5 17.0955 3.5 18.5C3.5 19.9045 3.5 20.6067 3.83706 21.1111C3.98298 21.3295 4.17048 21.517 4.38886 21.6629C4.89331 22 5.59554 22 7 22H18C19.4045 22 20.1067 22 20.6111 21.6629C20.8295 21.517 21.017 21.3295 21.1629 21.1111C21.5 20.6067 21.5 19.9045 21.5 18.5C21.5 17.0955 21.5 16.3933 21.1629 15.8889C21.017 15.6705 20.8295 15.483 20.6111 15.3371C20.1067 15 19.4045 15 18 15Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M19.5 15L18.8954 9.55827C18.7073 7.86575 18.6133 7.01949 18.0438 6.50974C17.4742 6 16.6228 6 14.9198 6H10.0802C8.37723 6 7.52576 6 6.95624 6.50974C6.38672 7.01949 6.29269 7.86575 6.10464 9.55827L5.5 15"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M11.5 2H14.5M17.5 2H14.5M14.5 2V6"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 18.5H15.5"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.5 9.5H11.5"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
};
