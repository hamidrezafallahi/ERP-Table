import type { IIconConfig } from "../type";

export const HeadOfAccountsIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
  width={config?.width ? `${config.width}` : "27"}
  height={config?.height ? `${config.height}` : "26"}
  viewBox="0 0 27 26"
  fill={config?.fill ? `${config.fill}` : "none"}
  xmlns="http://www.w3.org/2000/svg"
>
  <rect
    x="8.75"
    y="4.75"
    width="9.5"
    height="5.5"
    rx="1.25"
    className={
      !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
    }
    stroke={config?.stroke}
    strokeWidth="1.5"
    strokeLinejoin="round"
  />
  <rect
    x="1.75"
    y="14.75"
    width="5.5"
    height="5.5"
    rx="1.25"
    className={
      !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
    }
    stroke={config?.stroke}
    strokeWidth="1.5"
    strokeLinejoin="round"
  />
  <rect
    x="10.75"
    y="14.75"
    width="5.5"
    height="5.5"
    rx="1.25"
    className={
      !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
    }
    stroke={config?.stroke}
    strokeWidth="1.5"
    strokeLinejoin="round"
  />
  <rect
    x="19.75"
    y="14.75"
    width="5.5"
    height="5.5"
    rx="1.25"
    className={
      !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
    }
    stroke={config?.stroke}
    strokeWidth="1.5"
    strokeLinejoin="round"
  />
  <path
    d="M9 8H6.5C5.39543 8 4.5 8.89543 4.5 10V15.5"
    className={
      !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
    }
    stroke={config?.stroke}
  />
  <path
    d="M19 8H21C22.1046 8 23 8.89543 23 10V15"
    className={
      !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
    }
    stroke={config?.stroke}
  />
  <line
    x1="13.5"
    y1="10"
    x2="13.5"
    y2="15"
    className={
      !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
    }
    stroke={config?.stroke}
  />
</svg>
  );
};


