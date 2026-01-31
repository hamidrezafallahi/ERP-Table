import type { IIconConfig } from '../type';

export const Bell = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "22"}
      height={config?.height ? `${config.height}` : "22"}
      viewBox="0 0 22 22"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M17.1867 8.90048V8.25459C17.1867 4.70825 14.4168 1.83337 11 1.83337C7.58318 1.83337 4.8133 4.70825 4.8133 8.25459V8.90048C4.8133 9.6756 4.59224 10.4334 4.17798 11.0783L3.16283 12.6588C2.23559 14.1024 2.94346 16.0645 4.55617 16.521C8.77501 17.7153 13.225 17.7153 17.4438 16.521C19.0565 16.0645 19.7644 14.1024 18.8372 12.6588L17.822 11.0783C17.4078 10.4334 17.1867 9.6756 17.1867 8.90048Z"
        className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
      />
      <path
        opacity="0.5"
        d="M6.875 17.4166C7.47544 19.0188 9.09558 20.1666 11 20.1666C12.9044 20.1666 14.5246 19.0188 15.125 17.4166"
        className={
          !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};
