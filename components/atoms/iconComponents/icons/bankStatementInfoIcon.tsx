import type { IIconConfig } from "../type";

export const BankStatementInfoIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "24"}
      height={config?.height ? `${config.height}` : "24"}
      viewBox="0 0 24 24"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22 10V7.5C22 5.61438 22 4.67157 21.4142 4.08579C20.8284 3.5 19.8856 3.5 18 3.5H6C4.11438 3.5 3.17157 3.5 2.58579 4.08579C2 4.67157 2 5.61438 2 7.5V15.5C2 17.3856 2 18.3284 2.58579 18.9142C3.17157 19.5 4.11438 19.5 6 19.5H11"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 8.5H22"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M19.3333 12.5C19.7647 12.9332 19.4578 13.6717 18.8465 13.6717H16.8777C15.2884 13.6717 14 14.938 14 16.5C14 16.6706 14.0154 16.8377 14.0448 17M16.6667 20.5C16.2353 20.0668 16.5422 19.3283 17.1535 19.3283H19.1223C20.7116 19.3283 22 18.062 22 16.5C22 16.3294 21.9846 16.1623 21.9552 16"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
