import type { IIconConfig } from '../type';

export const ErrorAddIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "18"}
      height={config?.height ? `${config.height}` : "18"}
      viewBox="0 0 18 18"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17 12.2V5.8L12.2 1H5.8L1 5.8V12.2L5.8 17H12.2L17 12.2Z"
        className={!config?.stroke ? "stroke-[#DC3545] " : ""}
        stroke={config?.stroke}
        strokeLinejoin="round"
      />
      <g clipPath="url(#clip0_15618_88801)">
        <path
          d="M9.86372 5.61861C10.1742 5.28221 10.3295 5.11401 10.4944 5.01589C10.8925 4.77916 11.3826 4.7718 11.7873 4.99648C11.955 5.08959 12.1151 5.25306 12.4351 5.57999C12.7551 5.90693 12.9152 6.07039 13.0063 6.24173C13.2263 6.65514 13.2191 7.15584 12.9873 7.56247C12.8913 7.73099 12.7266 7.88958 12.3973 8.20676L8.4791 11.9806C7.85504 12.5817 7.54301 12.8822 7.15303 13.0346C6.76306 13.1869 6.33434 13.1757 5.47691 13.1533L5.36025 13.1502C5.09922 13.1434 4.9687 13.14 4.89284 13.0539C4.81697 12.9678 4.82733 12.8348 4.84804 12.5689L4.85929 12.4245C4.91759 11.6762 4.94675 11.302 5.09289 10.9656C5.23902 10.6292 5.49111 10.3561 5.99527 9.80988L9.86372 5.61861Z"
          className={!config?.stroke ? "stroke-[#DC3545] " : ""}
          stroke={config?.stroke}
          strokeLinejoin="round"
        />
        <path
          d="M9.41699 5.66699L12.3337 8.58366"
          className={!config?.stroke ? "stroke-[#DC3545] " : ""}
          stroke={config?.stroke}
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_15618_88801">
          <rect
            width={config?.width ? `${config.width}` : "10"}
            height={config?.height ? `${config.height}` : "10"}
            className={!config?.fill ? "fill-white dark:fill-gray-gray1" : ""}
            fill={config?.fill}
            transform="translate(4 4)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
