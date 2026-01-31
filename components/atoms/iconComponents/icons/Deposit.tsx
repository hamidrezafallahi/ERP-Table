import type { IIconConfig } from '../type';

export const Deposit = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_8690_53745)">
        <path
          d="M14.9993 4.53462C14.9993 4.53462 16.666 3.69835 17.7002 4.54505C17.8685 4.68118 18.0787 4.95066 18.1709 5.14877C18.3327 5.49611 18.3327 5.83293 18.3327 6.50658V15.6807C18.3327 16.5194 17.466 17.0955 16.666 16.9083C15.8996 16.7289 15.0543 16.6294 14.166 16.6294C12.5685 16.6294 11.1098 16.9511 9.99935 17.4811C8.8889 18.0111 7.43024 18.3328 5.83268 18.3328C4.94441 18.3328 4.09909 18.2333 3.33268 18.0539C2.84001 17.9386 2.59368 17.8809 2.2985 17.6422C2.13015 17.5061 1.92004 17.2366 1.82778 17.0385C1.66602 16.6912 1.66602 16.3544 1.66602 15.6807V6.50658C1.66602 5.66784 2.53271 5.09176 3.33268 5.27902C3.97829 5.43015 4.67991 5.52452 5.41602 5.55052"
          className={
            !config?.stroke ? "stroke-gray-gray9  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M12.0827 11.2493C12.0827 12.3999 11.1499 13.3327 9.99935 13.3327C8.84876 13.3327 7.91602 12.3999 7.91602 11.2493C7.91602 10.0988 8.84876 9.16602 9.99935 9.16602C11.1499 9.16602 12.0827 10.0988 12.0827 11.2493Z"
          className={
            !config?.stroke ? "stroke-gray-gray9  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
        />
        <path
          d="M4.58203 12.082L4.58203 12.0895"
          className={
            !config?.stroke ? "stroke-gray-gray9  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.416 10.4102L15.416 10.4176"
          className={
            !config?.stroke ? "stroke-gray-gray9  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.91602 4.58268C8.32562 5.0041 9.41583 6.66602 9.99935 6.66602M12.0827 4.58268C11.6731 5.0041 10.5829 6.66602 9.99935 6.66602M9.99935 6.66602V1.66602"
          className={
            !config?.stroke ? "stroke-gray-gray9  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_8690_53745">
          <rect
            width={config?.width ? `${config.width}` : "20"}
            height={config?.height ? `${config.height}` : "20"}
            fill={config?.fill}
            className={!config?.fill ? "fill-white dark:fill-gray-gray1" : ""}
          />
        </clipPath>
      </defs>
    </svg>
  );
};
