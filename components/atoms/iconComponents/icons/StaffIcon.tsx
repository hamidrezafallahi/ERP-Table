import type { IIconConfig } from '../type';

export const StaffIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "24"}
      height={config?.height ? `${config.height}` : "25"}
      viewBox="0 0 24 25"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 20.1172C17 18.4603 14.7614 17.1172 12 17.1172C9.23858 17.1172 7 18.4603 7 20.1172M21 17.1176C21 15.8874 19.7659 14.8301 18 14.3672M3 17.1176C3 15.8874 4.2341 14.8301 6 14.3672M18 10.3533C18.6137 9.80397 19 9.00569 19 8.11719C19 6.46033 17.6569 5.11719 16 5.11719C15.2316 5.11719 14.5308 5.40604 14 5.88108M6 10.3533C5.38625 9.80397 5 9.00569 5 8.11719C5 6.46033 6.34315 5.11719 8 5.11719C8.76835 5.11719 9.46924 5.40604 10 5.88108M12 14.1172C10.3431 14.1172 9 12.774 9 11.1172C9 9.46033 10.3431 8.11719 12 8.11719C13.6569 8.11719 15 9.46033 15 11.1172C15 12.774 13.6569 14.1172 12 14.1172Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
