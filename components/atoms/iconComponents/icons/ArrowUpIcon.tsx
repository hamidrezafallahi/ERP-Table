import type { IIconConfig } from '../type';

export const ArrowUpIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ?? 24}
      height={config?.height ?? 24}
      viewBox="0 0 24 24"
      fill={config?.fill ?? "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 16L8 8M8 8V14M8 8H14"
        className={
          !config?.stroke
            ? "stroke-[#767676] dark:stroke-gray-gray1"
            : undefined
        }
        stroke={config?.stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
