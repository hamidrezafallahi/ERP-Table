import type { IIconConfig } from '../type';

export const UserInfoIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "24"}
      height={config?.height ? `${config.height}` : "24"}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 9H18"
        stroke={config?.stroke??"#585858"} 
        className={
          !config?.stroke ? "stroke-gray-gray13  dark:stroke-gray-gray1" : ""
        }
        strokeLinecap="round"
      />
      <path
        d="M14 12.5H17"
        stroke={config?.stroke??"#585858"} 
        className={
          !config?.stroke ? "stroke-gray-gray13  dark:stroke-gray-gray1" : ""
        }
        strokeLinecap="round"
      />
      <rect
        x="2"
        y="3"
        width="20"
        height="18"
        rx="5"
        stroke={config?.stroke??"#585858"} 
        className={
          !config?.stroke ? "stroke-gray-gray13  dark:stroke-gray-gray1" : ""
        }
        strokeLinejoin="round"
      />
      <path
        d="M5 16C6.20831 13.4189 10.7122 13.2491 12 16"
        stroke={config?.stroke??"#585858"} 
        className={
          !config?.stroke ? "stroke-gray-gray13  dark:stroke-gray-gray1" : ""
        }
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 9C10.5 10.1046 9.60457 11 8.5 11C7.39543 11 6.5 10.1046 6.5 9C6.5 7.89543 7.39543 7 8.5 7C9.60457 7 10.5 7.89543 10.5 9Z"
        stroke={config?.stroke??"#585858"} 
        className={
          !config?.stroke ? "stroke-gray-gray13  dark:stroke-gray-gray1" : ""
        }
      />
    </svg>
  );
};
