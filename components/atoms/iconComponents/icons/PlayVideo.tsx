import type { IIconConfig } from '../type';

export const PlayVideo = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "34"}
      height={config?.height ? `${config.height}` : "34"}
      viewBox="0 0 34 34"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="17"
        cy="17"
        r="16.5"
        stroke={config?.stroke}
        fill={config?.fill}
        className={
          !config?.stroke && !config?.fill
            ? "fill-gray-gray10 dark:fill-gray-gray1 stroke-gray-gray7 dark:stroke-gray-gray1"
            : ""
        }
      />
      <path
        d="M11 22.3336V11.667C11 10.7874 11 10.3471 11.1851 10.0869C11.3466 9.85977 11.5956 9.71064 11.8721 9.67499C12.1887 9.63415 12.577 9.84126 13.3525 10.2549L23.3525 15.5882L23.3562 15.5898C24.2132 16.0469 24.642 16.2756 24.7826 16.5803C24.9053 16.8462 24.9053 17.1531 24.7826 17.4189C24.6418 17.7241 24.212 17.9537 23.3525 18.4121L13.3525 23.7454C12.5765 24.1593 12.1888 24.3657 11.8721 24.3248C11.5956 24.2891 11.3466 24.1401 11.1851 23.9129C11 23.6527 11 23.2132 11 22.3336Z"
        className={!config?.stroke ? "stroke-white dark:stroke-gray-gray1" : ""}
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
