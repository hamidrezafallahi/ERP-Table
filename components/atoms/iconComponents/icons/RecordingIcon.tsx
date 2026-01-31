import type { IIconConfig } from "../type";

export const RecordingIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.1667 5.83366V9.16699C14.1667 11.4682 12.3012 13.3337 10 13.3337C7.69882 13.3337 5.83334 11.4682 5.83334 9.16699V5.83366C5.83334 3.53247 7.69882 1.66699 10 1.66699C12.3012 1.66699 14.1667 3.53247 14.1667 5.83366Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke ? `${config.stroke}` : "#585858"}
      />
      <path
        d="M16.6667 9.16699C16.6667 12.8489 13.6819 15.8337 10 15.8337M10 15.8337C6.31811 15.8337 3.33334 12.8489 3.33334 9.16699M10 15.8337V18.3337M10 18.3337H12.5M10 18.3337H7.50001"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke ? `${config.stroke}` : "#585858"}
        strokeLinecap="round"
      />
    </svg>
  );
};
