import type { IIconConfig } from "../type";

export const EmptyChartIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 24 24"
      fill={config?.fill ? `${config.fill}` : "none"}
      stroke={config?.stroke}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={
        !config?.stroke ? "stroke-gray-gray6  dark:stroke-gray-gray1" : ""
      }
    >
      <path d="M3 20H21" />
      <path d="M4 4V20" />
      <rect x="6" y="12" width="2" height="6" rx="1" />
      <rect x="10" y="9" width="2" height="9" rx="1" />
      <rect x="14" y="6" width="2" height="12" rx="1" />
      <rect x="18" y="14" width="2" height="4" rx="1" />
    </svg>
  );
};
export default EmptyChartIcon;
