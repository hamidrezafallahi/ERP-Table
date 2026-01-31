import type { IIconConfig } from '../type';

export const MenuIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "30"}
      height={config?.height ? `${config.height}` : "30"}
      viewBox="0 0 31 30"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M7.21143 21.25H24.7114M7.21143 15H24.7114M7.21143 8.75H24.7114"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
