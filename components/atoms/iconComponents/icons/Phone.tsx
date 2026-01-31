import type { IIconConfig } from '../type';

export const Phone = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M7.52819 3.98713L8.01495 4.85933C8.45423 5.64644 8.27789 6.67899 7.58604 7.37085C7.58603 7.37085 7.58603 7.37085 7.58603 7.37085C7.58592 7.37097 6.74694 8.21016 8.26839 9.73161C9.78918 11.2524 10.6283 10.4148 10.6291 10.414C10.6292 10.4139 10.6292 10.414 10.6292 10.4139C11.321 9.72211 12.3536 9.54578 13.1407 9.98505L14.0129 10.4718C15.2014 11.1351 15.3418 12.8019 14.2971 13.8466C13.6693 14.4744 12.9003 14.9629 12.0502 14.9951C10.6191 15.0493 8.18871 14.6872 5.75078 12.2492C3.31285 9.81129 2.95066 7.38092 3.00491 5.94982C3.03714 5.0997 3.5256 4.33068 4.15335 3.70292C5.19807 2.65821 6.86488 2.79858 7.52819 3.98713Z"
        className={
          !config?.stroke ? "stroke-gray-gray10 dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
    </svg>
  );
};
