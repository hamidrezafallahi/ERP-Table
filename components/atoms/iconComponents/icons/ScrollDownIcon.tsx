import type { IIconConfig } from '../type';

export const ScrollDownIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "28"}
      height={config?.height ? `${config.height}` : "28"}
      viewBox="0 0 28 28"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.668 8.16536L14.0013 12.832L9.33464 8.16536M18.668 15.1654L14.0013 19.832L9.33464 15.1654"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth={config?.strokeWidth ? `${config.strokeWidth}` : "2"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
