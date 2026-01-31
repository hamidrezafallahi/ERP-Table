import type { IIconConfig } from '../type';

export const MinusIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "16"}
      height={config?.height ? `${config.height}` : "16"}
      viewBox="0 0 16 16"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 8H12"
        className={
          !config?.stroke ? "stroke-gray-gray9  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth={config?.strokeWidth ? `${config.strokeWidth}` : "1"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
