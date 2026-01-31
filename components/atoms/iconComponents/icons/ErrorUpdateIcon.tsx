import type { IIconConfig } from '../type';

export const ErrorUpdateIcon = ({ config }: { config?: IIconConfig }) => {
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
        className={!config?.stroke ? "stroke-[#DC3545]" : ""}
        stroke={config?.stroke}
        strokeLinejoin="round"
      />
      <g clipPath="url(#clip0_15618_88803)">
        <path
          d="M11.9163 4.83301V6.02408C11.1648 5.28731 10.1353 4.83301 8.99967 4.83301C6.69849 4.83301 4.83301 6.69849 4.83301 8.99967C4.83301 9.59226 4.95671 10.156 5.17971 10.6663M6.08301 13.1663V11.9753C6.83457 12.712 7.86407 13.1663 8.99967 13.1663C11.3009 13.1663 13.1663 11.3009 13.1663 8.99967C13.1663 8.40709 13.0426 7.84339 12.8196 7.33301"
          className={!config?.stroke ? "stroke-[#DC3545]" : ""}
          stroke={config?.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_15618_88803">
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
