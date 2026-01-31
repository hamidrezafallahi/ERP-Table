import type { IIconConfig } from '../type';

export const PendingUpdateIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 100 100"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="50"
        cy="50"
        r="45"
        className={
          !config?.stroke ? "stroke-[#000] dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="5"
        strokeDasharray="40 20"
        fill={config?.fill ? `${config.fill}` : "none"}
      >
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 50 50"
          to="360 50 50"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>

      <line
        x1="35"
        y1="65"
        x2="65"
        y2="35"
        className={
          !config?.stroke ? "stroke-[#000] dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="6"
        strokeLinecap="round"
      />

      <polyline
        points="61 39, 66 34, 68 36, 63 41"
        className={
          !config?.stroke ? "stroke-[#000] dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="6"
        fill={config?.fill ? `${config.fill}` : "none"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
