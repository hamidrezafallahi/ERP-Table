import type { IIconConfig } from '../type';

export const Sound = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "36"}
      height={config?.height ? `${config.height}` : "36"}
      viewBox="0 0 36 36"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M13.5 28.5C13.5 30.9853 11.4853 33 9 33C6.51472 33 4.5 30.9853 4.5 28.5C4.5 26.0147 6.51472 24 9 24C11.4853 24 13.5 26.0147 13.5 28.5Z"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
      />
      <path
        d="M31.5 25.5C31.5 27.9853 29.4853 30 27 30C24.5147 30 22.5 27.9853 22.5 25.5C22.5 23.0147 24.5147 21 27 21C29.4853 21 31.5 23.0147 31.5 25.5Z"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
      />
      <path
        d="M13.5 28.5V12"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
      />
      <path
        d="M31.5 25.5V9"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
      />
      <path
        d="M23.6026 5.63248L17.6026 7.63248C15.6226 8.2925 14.6325 8.62251 14.0663 9.40817C13.5 10.1938 13.5 11.2374 13.5 13.3246V18L31.5 12V11.3246C31.5 7.52589 31.5 5.62655 30.2541 4.72857C29.0083 3.8306 27.2064 4.43123 23.6026 5.63248Z"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
};
