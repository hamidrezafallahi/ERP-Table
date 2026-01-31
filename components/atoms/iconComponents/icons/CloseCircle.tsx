import type { IIconConfig } from '../type';

export const CloseCircle = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "22"}
      height={config?.height ? `${config.height}` : "22"}
      viewBox="0 0 22 22"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.75 7.75L10.9999 10.9999M10.9999 10.9999L14.2499 14.2499M10.9999 10.9999L7.75 14.2499M10.9999 10.9999L14.2499 7.75M11 20.75C5.61522 20.75 1.25 16.3848 1.25 11C1.25 5.61522 5.61522 1.25 11 1.25C16.3848 1.25 20.75 5.61522 20.75 11C20.75 16.3848 16.3848 20.75 11 20.75Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth={config?.strokeWidth ? `${config.strokeWidth}` : "1.25"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
