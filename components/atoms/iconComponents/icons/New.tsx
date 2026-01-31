import type { IIconConfig } from '../type';

export const New = ({
  config,
  inheritStyle = false,
}: {
  config?: IIconConfig;
  inheritStyle?: boolean;
}) => {
  if (inheritStyle) {
    return (
      <svg
        style={{ color: "inherit" }}
        width={config?.width ? `${config.width}` : "30"}
        height={config?.height ? `${config.height}` : "30"}
        viewBox="0 0 30 30"
        fill={config?.fill ? `${config.fill}` : "none"}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          style={{ color: "inherit" }}
          d="M15 22.5L15 14.558M15 14.558C15 14.558 15 7.49999 14.9999 6.99999M15 14.558L23 14.558M15 14.558L6.99999 14.558"
          stroke={config?.stroke ? config.stroke : "currentColor"}
          strokeWidth={config?.strokeWidth ? `${config.strokeWidth}` : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  } else {
    return (
      <svg
        width={config?.width ? `${config.width}` : "30"}
        height={config?.height ? `${config.height}` : "30"}
        viewBox="0 0 30 30"
        fill={config?.fill ? `${config.fill}` : "none"}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 22.5L15 14.558M15 14.558C15 14.558 15 7.49999 14.9999 6.99999M15 14.558L23 14.558M15 14.558L6.99999 14.558"
          className={
            !config?.stroke ? "stroke-black-black1  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth={config?.strokeWidth ? `${config.strokeWidth}` : "2"}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
};
