import type { IIconConfig } from '../type';

export const Withdrawal = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_8690_53795)">
        <path
          d="M5.83268 5.55778C4.94441 5.55778 4.09909 5.45835 3.33268 5.27895C2.53271 5.09169 1.66602 5.66776 1.66602 6.5065V15.6806C1.66602 16.3543 1.66602 16.6911 1.82778 17.0384C1.92004 17.2366 2.13015 17.506 2.2985 17.6422C2.59368 17.8809 2.84001 17.9385 3.33268 18.0539C4.09909 18.2333 4.94441 18.3327 5.83268 18.3327C7.43024 18.3327 8.8889 18.0111 9.99935 17.481C11.1098 16.951 12.5685 16.6294 14.166 16.6294C15.0543 16.6294 15.8996 16.7288 16.666 16.9082C17.466 17.0955 18.3327 16.5194 18.3327 15.6806V6.5065C18.3327 5.83286 18.3327 5.49604 18.1709 5.14869C18.0787 4.95059 17.8685 4.68111 17.7002 4.54497C16.666 3.69828 14.9993 4.53454 14.9993 4.53454"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M12.0827 11.2493C12.0827 12.3999 11.1499 13.3327 9.99935 13.3327C8.84876 13.3327 7.91602 12.3999 7.91602 11.2493C7.91602 10.0988 8.84876 9.16602 9.99935 9.16602C11.1499 9.16602 12.0827 10.0988 12.0827 11.2493Z"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
        />
        <path
          d="M4.58203 12.082L4.58203 12.0895"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.416 10.4102L15.416 10.4176"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.91602 3.74935C8.32562 3.32793 9.41583 1.66602 9.99935 1.66602M12.0827 3.74935C11.6731 3.32793 10.5829 1.66602 9.99935 1.66602M9.99935 1.66602V6.66602"
          className={
            !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
          }
          stroke={config?.stroke}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_8690_53795">
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
