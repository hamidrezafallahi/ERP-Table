import type { IIconConfig } from '../type';

export const CustomerCreditIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9 10.535C7.34453 10.3803 5.64793 10.739 4.18318 11.6112C3.1221 12.243 0.340023 13.5331 2.0345 15.1474C2.86223 15.936 3.78412 16.5 4.94315 16.5H9.75"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.625 4.875C11.625 6.73896 10.114 8.25 8.25 8.25C6.38604 8.25 4.875 6.73896 4.875 4.875C4.875 3.01104 6.38604 1.5 8.25 1.5C10.114 1.5 11.625 3.01104 11.625 4.875Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.8"
      />
      <path
        d="M13.4994 10.5C12.5496 10.5 11.9337 11.1057 11.2054 11.3265C10.9092 11.4162 10.7611 11.4611 10.7012 11.5244C10.6413 11.5877 10.6237 11.6801 10.5886 11.865C10.2131 13.8438 11.034 15.6732 12.9917 16.3852C13.202 16.4617 13.3072 16.5 13.5005 16.5C13.6937 16.5 13.7989 16.4617 14.0092 16.3852C15.9668 15.6732 16.7869 13.8438 16.4113 11.865C16.3761 11.6801 16.3586 11.5876 16.2986 11.5243C16.2387 11.4611 16.0906 11.4162 15.7945 11.3265C15.0659 11.1057 14.4493 10.5 13.4994 10.5Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
