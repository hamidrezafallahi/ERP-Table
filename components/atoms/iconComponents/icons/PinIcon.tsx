import type { IIconConfig } from '../type';

export const PinIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2.5 17.4997L6.66667 13.333"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.0487 15.7261C7.92932 15.0179 4.98205 12.0706 4.2738 8.95125C4.16168 8.45745 4.10562 8.21055 4.26803 7.80998C4.43043 7.40941 4.62883 7.28546 5.02561 7.03757C5.92256 6.47721 6.89381 6.29907 7.90176 6.38822C9.31611 6.51332 10.0233 6.57586 10.3761 6.39206C10.7288 6.20826 10.9686 5.77848 11.448 4.91891L12.0554 3.83003C12.4555 3.11273 12.6555 2.75408 13.1261 2.58501C13.5967 2.41594 13.8799 2.51833 14.4462 2.72309C15.7708 3.20196 16.798 4.22921 17.2769 5.55374C17.4817 6.12014 17.5841 6.40334 17.415 6.87392C17.2459 7.3445 16.8873 7.54455 16.17 7.94465L15.056 8.56599C14.198 9.04453 13.7691 9.2838 13.5853 9.64002C13.4016 9.99624 13.4683 10.688 13.6018 12.0716C13.6999 13.089 13.5308 14.0667 12.9629 14.9747C12.7148 15.3715 12.5907 15.5699 12.1902 15.7321C11.7898 15.8944 11.5428 15.8383 11.0487 15.7261Z"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
