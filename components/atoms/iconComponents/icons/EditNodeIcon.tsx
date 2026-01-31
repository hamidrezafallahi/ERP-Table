import type { IIconConfig } from "../type";

export const EditNodeIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "28"}
      height={config?.height ? `${config.height}` : "28"}
      viewBox="0 0 28 28"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width={config?.width ? `${config.width}` : "28"}
        height={config?.height ? `${config.height}` : "28"}
        rx="4"
        className={
          !config?.fill ? "stroke-gray-gray2  dark:stroke-gray-gray1" : ""
        }
        fill={config?.fill}
      />
      <path
        d="M12.0002 6H9.2002C8.08009 6 7.51962 6 7.0918 6.21799C6.71547 6.40973 6.40973 6.71547 6.21799 7.0918C6 7.51962 6 8.08009 6 9.2002V18.8002C6 19.9203 6 20.4801 6.21799 20.9079C6.40973 21.2842 6.71547 21.5905 7.0918 21.7822C7.5192 22 8.07899 22 9.19691 22H18.8031C19.921 22 20.48 22 20.9074 21.7822C21.2837 21.5905 21.5905 21.2839 21.7822 20.9076C22 20.4802 22 19.921 22 18.8031V16M18 7L12 13V16H15L21 10M18 7L21 4L24 7L21 10M18 7L21 10"
        className={
          !config?.stroke ? "stroke-gray-gray12  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
