import type { IIconConfig } from "../type";

export const DisableIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "21"}
      height={config?.height ? `${config.height}` : "21"}
      viewBox="0 0 21 21"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.834 10.5L7.16732 10.5"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.8346 10.4987C18.8346 5.89632 15.1037 2.16536 10.5013 2.16536C5.89893 2.16536 2.16797 5.89632 2.16797 10.4987C2.16797 15.1011 5.89893 18.832 10.5013 18.832C15.1037 18.832 18.8346 15.1011 18.8346 10.4987Z"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
    </svg>
  );
};
