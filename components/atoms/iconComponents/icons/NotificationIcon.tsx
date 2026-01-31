import { IIconConfig } from '../type';

export const NotificationIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.9972 1.66602C7.49072 1.66602 5.86552 3.34851 3.94346 3.96177C3.16194 4.21112 2.77117 4.3358 2.61303 4.51156C2.45489 4.68731 2.40858 4.94414 2.31597 5.45779C1.32489 10.9543 3.49111 16.036 8.65728 18.0139C9.21235 18.2264 9.48989 18.3327 9.99993 18.3327C10.51 18.3327 10.7875 18.2264 11.3425 18.0139C16.5084 16.036 18.6725 10.9543 17.6812 5.45779C17.5885 4.94405 17.5422 4.68718 17.384 4.51142C17.2258 4.33566 16.8351 4.21106 16.0536 3.96184C14.1308 3.34864 12.5038 1.66602 9.9972 1.66602Z"
        className={
          !config?.stroke ? "stroke-[#585858] dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 10.8333C7.5 10.8333 8.33333 10.8333 9.16667 12.5C9.16667 12.5 11.8137 8.33333 14.1667 7.5"
        className={
          !config?.stroke ? "stroke-[#585858] dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
