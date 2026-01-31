import type { IIconConfig } from '../type';

export const DatabaseCheck = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "21"}
      viewBox="0 0 20 21"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.2 12.1161L8.8 13.7315L12 10.5008M10.4 2.42453C10.3236 2.42383 10.2378 2.42383 10.1398 2.42383H6.56016C5.66407 2.42383 5.2157 2.42383 4.87344 2.59989C4.57238 2.75477 4.32779 3.00171 4.17439 3.30566C4 3.65121 4 4.1039 4 5.0086V14.3778C4 15.2825 4 15.7346 4.17439 16.0802C4.32779 16.3842 4.57238 16.6315 4.87344 16.7864C5.21536 16.9623 5.6632 16.9623 6.55755 16.9623L12.6425 16.9623C13.5368 16.9623 13.984 16.9623 14.3259 16.7864C14.627 16.6315 14.8724 16.3841 15.0258 16.0802C15.2 15.735 15.2 15.2835 15.2 14.3806V7.53303C15.2 7.43391 15.2 7.3472 15.1993 7.26998M10.4 2.42453C10.6285 2.42663 10.7731 2.43501 10.9111 2.46846C11.0743 2.50803 11.2303 2.57346 11.3734 2.66203C11.5349 2.7619 11.6735 2.90184 11.95 3.18104L14.4504 5.70547C14.7271 5.98485 14.8647 6.12416 14.9636 6.28718C15.0514 6.43171 15.1163 6.5893 15.1555 6.75413C15.1886 6.8934 15.1971 7.03939 15.1993 7.26998M10.4 2.42453V4.68537C10.4 5.59007 10.4 6.0421 10.5744 6.38765C10.7278 6.69161 10.9724 6.93922 11.2734 7.09409C11.6154 7.26998 12.0632 7.26998 12.9575 7.26998H15.1993M15.1993 7.26998H15.2002"
        className={
          !config?.stroke ? "stroke-gray-gray8  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g clipPath="url(#clip0_7127_46617)">
        <rect
          width={config?.width ? `${config.width}` : "8"}
          height={config?.height ? `${config.height}` : "9.69231"}
          transform="translate(12 11.3086)"
          fill={config?.fill}
          className={!config?.fill ? "fill-white dark:fill-gray-gray1" : ""}
        />
        <path
          d="M18.0371 15.6417V17.8445C18.0371 18.5744 16.8649 19.1661 15.419 19.1661C13.973 19.1661 12.8008 18.5744 12.8008 17.8445V15.6417M18.0371 15.6417V13.4389M18.0371 15.6417C18.0371 16.3716 16.8649 16.9633 15.419 16.9633C13.973 16.9633 12.8008 16.3716 12.8008 15.6417M18.0371 13.4389C18.0371 12.7089 16.8649 12.1172 15.419 12.1172C13.973 12.1172 12.8008 12.7089 12.8008 13.4389M18.0371 13.4389C18.0371 14.1688 16.8649 14.7605 15.419 14.7605C13.973 14.7605 12.8008 14.1688 12.8008 13.4389M12.8008 15.6417V13.4389"
          className={
            !config?.stroke ? "stroke-main-black  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_7127_46617">
          <rect
            width={config?.width ? `${config.width}` : "8"}
            height={config?.height ? `${config.height}` : "9.69231"}
            fill={config?.fill}
            className={!config?.fill ? "fill-white dark:fill-gray-gray1" : ""}
            transform="translate(12 11.3086)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};
