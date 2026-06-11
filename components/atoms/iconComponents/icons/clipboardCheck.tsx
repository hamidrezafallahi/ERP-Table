import type { IIconConfig } from '../type';

export const ClipboardCheck = ({
  config,
}: {
  config?: IIconConfig;
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "31"}
      height={config?.height ? `${config.height}` : "31"}
      viewBox="0 0 52 52"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M44 2.5H19C16.4 2.5 14.3 4.6 14.3 7.2V8C14.3 8.5 14.6 8.8 15.1 8.8H37.8C40.4 8.8 42.5 10.9 42.5 13.5V37.8C42.5 38.3 42.8 38.6 43.3 38.6H44C46.6 38.6 48.7 36.5 48.7 33.9V7.2C48.7 4.6 46.6 2.5 44 2.5Z"
        className={
          !config?.stroke
            ? "stroke-gray-gray10 dark:stroke-gray-gray1"
            : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M33 13.5H8C5.4 13.5 3.3 15.6 3.3 18.2V44.8C3.3 47.4 5.4 49.5 8 49.5H33C35.6 49.5 37.8 47.4 37.8 44.8V18.2C37.8 15.6 35.6 13.5 33 13.5ZM31 26.8L19 38.8C18.5 39.3 18 39.5 17.4 39.5C16.9 39.5 16.2 39.3 15.8 38.8L10 33C9.5 32.5 9.5 31.8 10 31.4L11.6 29.8C12.1 29.3 12.8 29.3 13.2 29.8L17.4 34L27.7 23.7C28.2 23.2 28.9 23.2 29.3 23.7L30.9 25.3C31.4 25.6 31.4 26.4 31 26.8Z"
        className={
          !config?.stroke
            ? "stroke-gray-gray10 dark:stroke-gray-gray1"
            : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="#000"
      />
    </svg>
  );
};