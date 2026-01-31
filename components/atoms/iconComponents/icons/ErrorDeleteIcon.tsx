import type { IIconConfig } from '../type';

export const ErrorDeleteIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 12.2V5.8L12.2 1H5.8L1 5.8V12.2L5.8 17H12.2L17 12.2Z"
        className={!config?.stroke ? "stroke-[#DC3545] " : ""}
        stroke={config?.stroke}
        strokeLinejoin="round"
      />
      <path
        d="M12.5 5.5L5.5 12.5M5.5 5.5L12.5 12.5"
        className={!config?.stroke ? "stroke-[#DC3545] " : ""}
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
