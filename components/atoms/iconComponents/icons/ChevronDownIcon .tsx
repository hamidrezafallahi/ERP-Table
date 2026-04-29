import type { IIconConfig } from "../type";

export const ChevronDownIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 24 24"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
      className={config?.className}
    >
      <path
        className={
          !config?.stroke && !config?.fill
            ? "fill-scrollbar dark:fill-gray-gray1 stroke-main-black dark:stroke-gray-gray1"
            : ""
        }
        stroke={config?.stroke}
        fill={config?.fill}
        d="M6 9l6 6 6-6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
