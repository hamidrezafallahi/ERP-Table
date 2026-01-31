import type { IIconConfig } from '../type';

export const ResendCodeIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.33329 6.66667H4.16663V2.5M4.40914 13.6308C5.18566 14.8265 6.32508 15.7418 7.66011 16.2423C8.99514 16.7428 10.4558 16.802 11.827 16.4114C13.1982 16.0208 14.4077 15.2011 15.2786 14.0723C16.1495 12.9434 16.6358 11.565 16.6657 10.1396C16.6955 8.71412 16.2676 7.31668 15.4447 6.15234C14.6218 4.98801 13.4471 4.11833 12.0935 3.67065C10.7398 3.22298 9.27836 3.22083 7.92354 3.66496C6.56872 4.10909 5.39212 4.97579 4.5662 6.13796"
        stroke={config?.stroke ? config.stroke : "#585858"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
