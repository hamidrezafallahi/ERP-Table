import { IIconConfig } from "../type";

export const WonderIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_1209_1470)">
        <circle
          cx="9.99999"
          cy="10.0001"
          r="8.33333"
          stroke={config?.stroke ? config.stroke : "#025099"}
          strokeWidth="1.5"
        />
        <path
          d="M9.99334 12.5H10.0008"
          stroke={config?.stroke ? config.stroke : "#025099"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 10L10 6.66667"
          stroke={config?.stroke ? config.stroke : "#025099"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1209_1470">
          <rect
            width={config?.width ? `${config.width}` : "20"}
            height={config?.height ? `${config.height}` : "20"}
            fill={config?.fill ? config.fill : "#ffff"}
          />
        </clipPath>
      </defs>
    </svg>
  );
};
