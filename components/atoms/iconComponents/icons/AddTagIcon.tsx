import type { IIconConfig } from '../type';

export const AddTagIcon = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "16"}
      height={config?.height ? `${config.height}` : "16"}
      viewBox="0 0 16 16"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_14604_82681)">
        <circle
          cx="1"
          cy="1"
          r="1"
          transform="matrix(1 0 0 -1 10.6665 5.3335)"
          className={
            !config?.stroke ? "stroke-gray-gray85  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M1.84965 7.42921C1.18089 8.17611 1.1665 9.30298 1.78027 10.0957C2.99824 11.6688 4.33132 13.0018 5.90438 14.2198C6.6971 14.8336 7.82397 14.8192 8.57088 14.1504C10.5988 12.3347 12.4559 10.4372 14.2481 8.35189C14.4253 8.14572 14.5361 7.89304 14.561 7.62234C14.671 6.42524 14.897 2.97637 13.9603 2.03975C13.0237 1.10313 9.57484 1.3291 8.37774 1.43909C8.10704 1.46397 7.85436 1.57481 7.6482 1.75199C5.56291 3.54422 3.66537 5.40132 1.84965 7.42921Z"
          className={
            !config?.stroke ? "stroke-gray-gray85  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
        />
        <path
          d="M4.6665 9.3335L6.6665 11.3335"
          className={
            !config?.stroke ? "stroke-gray-gray85  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12Z"
          className={
            !config?.stroke && !config?.fill
              ? "fill-white dark:fill-gray-gray1 stroke-gray-gray85 dark:stroke-gray-gray1"
              : ""
          }
          strokeWidth="0.8"
          stroke={config?.stroke}
          fill={config?.fill}
        />
        <path
          className={
            !config?.stroke ? "stroke-gray-gray85  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_14604_82681">
          <rect
            width={config?.width ? `${config.width}` : "16"}
            height={config?.height ? `${config.height}` : "16"}
            className={!config?.fill ? "fill-white dark:fill-gray-gray1" : ""}
            fill={config?.fill}
          />
        </clipPath>
      </defs>
    </svg>
  );
};
