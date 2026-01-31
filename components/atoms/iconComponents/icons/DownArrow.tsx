import type { IIconConfig } from '../type';

export const DownArrow = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M9.99984 5.83337V14.1667M9.99984 14.1667L13.3332 10.8334M9.99984 14.1667L6.6665 10.8334"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
