import type { IIconConfig } from '../type';

export const QuestionIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <>
      <svg
        width={config?.width ? `${config.width}` : "20"}
        height={config?.height ? `${config.height}` : "20"}
        viewBox="0 0 20 20"
        fill={config?.fill ? `${config.fill}` : "none"}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_9120_59809)">
          <circle
            cx="10.0003"
            cy="9.99984"
            r="8.33333"
            className={
              !config?.stroke ? "stroke-gray-gray9 dark:stroke-gray-gray1" : ""
            }
            stroke={config?.stroke}
            strokeWidth="1.5"
          />
          <path
            d="M8.33398 7.49967C8.33398 6.5792 9.08018 5.83301 10.0007 5.83301C10.9211 5.83301 11.6673 6.5792 11.6673 7.49967C11.6673 7.83147 11.5704 8.14061 11.4032 8.40033C10.9052 9.1744 10.0007 9.91253 10.0007 10.833V11.2497"
            className={
              !config?.stroke ? "stroke-gray-gray9 dark:stroke-gray-gray1" : ""
            }
            stroke={config?.stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M9.99414 14.1665H10.0016"
            className={
              !config?.stroke ? "stroke-gray-gray9 dark:stroke-gray-gray1" : ""
            }
            stroke={config?.stroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_9120_59809">
            <rect
              width={config?.width ? `${config.width}` : "20"}
              height={config?.height ? `${config.height}` : "20"}
              className={
                !config?.fill ? "fill-white  dark:fill-gray-gray1" : ""
              }
              fill={config?.fill}
            />
          </clipPath>
        </defs>
      </svg>
    </>
  );
};
