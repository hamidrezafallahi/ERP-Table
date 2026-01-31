import type { IIconConfig } from "../type";

export const TabletIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "28"}
      height={config?.height ? `${config.height}` : "28"}
      viewBox="0 0 28 28"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.3327 16.9141V7.58073C23.3327 5.38084 23.3327 4.2809 22.6493 3.59748C21.9658 2.91406 20.8659 2.91406 18.666 2.91406H9.33268C7.13279 2.91406 6.03285 2.91406 5.34943 3.59748C4.66602 4.2809 4.66602 5.38084 4.66602 7.58073V16.9141"
        className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth={config?.strokeWidth ? `${config.strokeWidth}` : "1.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 6.41406H14.0105"
        className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.07925 18.0987L4.68815 16.9141H23.2758L23.918 18.0987C25.6014 21.2038 26.0207 22.7564 25.3809 23.9186C24.741 25.0807 23.0446 25.0807 19.6517 25.0807L8.34576 25.0807C4.95285 25.0807 3.2564 25.0807 2.61655 23.9186C1.9767 22.7564 2.3959 21.2038 4.07925 18.0987Z"
        className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth={config?.strokeWidth ? `${config.strokeWidth}` : "1.5"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
