import type { IIconConfig } from '../type';

export const ProfileIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "39"}
      height={config?.height ? `${config.height}` : "39"}
      viewBox="0 0 39 39"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M27.977 31.4149C25.8942 29.0888 22.8681 27.625 19.5 27.625C16.1319 27.625 13.1055 29.0888 11.0227 31.4149M19.5 34.125C11.4228 34.125 4.875 27.5772 4.875 19.5C4.875 11.4228 11.4228 4.875 19.5 4.875C27.5772 4.875 34.125 11.4228 34.125 19.5C34.125 27.5772 27.5772 34.125 19.5 34.125ZM19.5 22.75C16.8076 22.75 14.625 20.5674 14.625 17.875C14.625 15.1826 16.8076 13 19.5 13C22.1924 13 24.375 15.1826 24.375 17.875C24.375 20.5674 22.1924 22.75 19.5 22.75Z"
        className={
          !config?.stroke ? "stroke-gray-gray7 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
