import type { IIconConfig } from '../type';

export const LightModeIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "24"}
      height={config?.height ? `${config.height}` : "24"}
      viewBox="0 0 24 24"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 12.5C17 15.2614 14.7614 17.5 12 17.5C9.23858 17.5 7 15.2614 7 12.5C7 9.73858 9.23858 7.5 12 7.5C14.7614 7.5 17 9.73858 17 12.5Z"
        className={
          !config?.stroke ? "stroke-gray-gray9  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        d="M12 2.5V4M12 21V22.5M19.0708 19.5713L18.0101 18.5106M5.98926 6.48926L4.9286 5.4286M22 12.5H20.5M3.5 12.5H2M19.0713 5.42871L18.0106 6.48937M5.98975 18.5107L4.92909 19.5714"
        className={
          !config?.stroke ? "stroke-gray-gray9  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
