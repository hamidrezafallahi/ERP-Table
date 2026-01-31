import type { IIconConfig } from '../type';

export const FilledCircleList = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="9"
        cy="9"
        r="8.5"
        stroke={config?.stroke}
        fill={config?.fill}
        className={
          !config?.stroke && !config?.fill
            ? "fill-main-black dark:fill-gray-gray1 stroke-gray-gray8 dark:stroke-gray-gray1"
            : ""
        }
      />
      <path
        d="M7.24935 11.9173H13.0827M7.24935 9.00065H13.0827M7.24935 6.08398H13.0827M4.91715 11.9173V11.9185L4.91602 11.9185V11.9173H4.91715ZM4.91715 9.00065V9.00182L4.91602 9.00179V9.00065H4.91715ZM4.91715 6.08398V6.08515L4.91602 6.08512V6.08398H4.91715Z"
        className={!config?.stroke ? "stroke-white dark:stroke-gray-gray1" : ""}
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
