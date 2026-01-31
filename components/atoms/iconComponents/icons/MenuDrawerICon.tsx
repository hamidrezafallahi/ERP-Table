import type { IIconConfig } from '../type';

export const MenuDrawerIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <div className="flex flex-col gap-1">
      <svg
        width={config?.width ? `${config.width}` : "38"}
        height={config?.height ? `${config.height}` : "4"}
        viewBox="0 0 38 4"
        fill={config?.fill ? `${config.fill}` : "none"}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 2L36 2"
          className={
            !config?.stroke ? "stroke-gray-gray85  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      {/* <svg
        width={config?.width ? `${config.width}` : "38"}
        height={config?.height ? `${config.height}` : "4"}
        viewBox="0 0 38 4"
        fill={config?.fill ? `${config.fill}` : "none"}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2 2L36 2"
          stroke={config?.stroke ? config.stroke : "#848484"}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg> */}
    </div>
  );
};
