import type { IIconConfig } from '../type';

export const PauseVideo = ({ config }: { config?: IIconConfig }) => {
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
        d="M20 10.5V23.5C20 23.9647 20 24.197 20.0384 24.3902C20.1962 25.1836 20.816 25.8041 21.6094 25.9619C21.8026 26.0003 22.0349 26.0003 22.4996 26.0003C22.9642 26.0003 23.1974 26.0003 23.3906 25.9619C24.184 25.8041 24.8041 25.1836 24.9619 24.3902C25 24.1987 25 23.9687 25 23.5122V10.4878C25 10.0312 25 9.80087 24.9619 9.60938C24.8041 8.81599 24.1836 8.19624 23.3902 8.03843C23.197 8 22.9647 8 22.5 8C22.0353 8 21.8026 8 21.6094 8.03843C20.816 8.19624 20.1962 8.81599 20.0384 9.60938C20 9.80257 20 10.0353 20 10.5Z"
        className={!config?.stroke ? "stroke-white dark:stroke-gray-gray4" : ""}
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 10.5V23.5C9 23.9647 9 24.197 9.03843 24.3902C9.19624 25.1836 9.81599 25.8041 10.6094 25.9619C10.8026 26.0003 11.0349 26.0003 11.4996 26.0003C11.9642 26.0003 12.1974 26.0003 12.3906 25.9619C13.184 25.8041 13.8041 25.1836 13.9619 24.3902C14 24.1987 14 23.9687 14 23.5122V10.4878C14 10.0312 14 9.80087 13.9619 9.60938C13.8041 8.81599 13.1836 8.19624 12.3902 8.03843C12.197 8 11.9647 8 11.5 8C11.0353 8 10.8026 8 10.6094 8.03843C9.81599 8.19624 9.19624 8.81599 9.03843 9.60938C9 9.80257 9 10.0353 9 10.5Z"
        className={
          !config?.stroke ? "stroke-white  dark:stroke-gray-gray4" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
