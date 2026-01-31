import type { IIconConfig } from '../type';

export const ReceiptsAndPayments = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "25"}
      height={config?.height ? `${config.height}` : "24"}
      viewBox="0 0 25 24"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        opacity="0.5"
        d="M21 7V13C21 16.7712 21 18.6569 19.8284 19.8284C18.6569 21 16.7712 21 13 21H12C8.22876 21 6.34315 21 5.17157 19.8284C4 18.6569 4 16.7712 4 13V7"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M2.5 5C2.5 4.05719 2.5 3.58579 2.79289 3.29289C3.08579 3 3.55719 3 4.5 3H20.5C21.4428 3 21.9142 3 22.2071 3.29289C22.5 3.58579 22.5 4.05719 22.5 5C22.5 5.94281 22.5 6.41421 22.2071 6.70711C21.9142 7 21.4428 7 20.5 7H4.5C3.55719 7 3.08579 7 2.79289 6.70711C2.5 6.41421 2.5 5.94281 2.5 5Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M12.5 7L12.5 16M12.5 16L15.5 12.6667M12.5 16L9.5 12.6667"
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
