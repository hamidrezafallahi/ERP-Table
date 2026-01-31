import type { IIconConfig } from '../type';

export const GuaranteeIssuing = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.15 6.70009L15.5362 6.31389C16.1761 5.67402 17.2135 5.67402 17.8534 6.31389C18.4933 6.95377 18.4933 7.99121 17.8534 8.63109L17.4672 9.01729M15.15 6.70009C15.15 6.70009 15.1983 7.52077 15.9224 8.24489C16.6466 8.96902 17.4672 9.01729 17.4672 9.01729M15.15 6.70009L11.5995 10.2506C11.359 10.4911 11.2388 10.6113 11.1354 10.7439C11.0134 10.9003 10.9088 11.0695 10.8235 11.2486C10.7511 11.4004 10.6974 11.5617 10.5898 11.8843L10.2455 12.9173L10.1341 13.2515M17.4672 9.01729L13.9167 12.5678C13.6762 12.8083 13.556 12.9285 13.4234 13.0319C13.267 13.1539 13.0978 13.2585 12.9187 13.3438C12.767 13.4162 12.6056 13.47 12.283 13.5775L11.25 13.9218L10.9158 14.0332M10.9158 14.0332L10.5816 14.1446C10.4228 14.1976 10.2478 14.1562 10.1294 14.0379C10.0111 13.9195 9.96976 13.7445 10.0227 13.5857L10.1341 13.2515M10.9158 14.0332L10.1341 13.2515"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        d="M6.66602 10.834H8.74935"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        d="M6.66602 7.5H12.0827"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        d="M6.66602 14.166H7.91602"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        d="M2.5 8.33268C2.5 5.18999 2.5 3.61864 3.47631 2.64233C4.45262 1.66602 6.02397 1.66602 9.16667 1.66602H10.8333C13.976 1.66602 15.5474 1.66602 16.5237 2.64233C17.5 3.61864 17.5 5.18999 17.5 8.33268V11.666C17.5 14.8087 17.5 16.3801 16.5237 17.3564C15.5474 18.3327 13.976 18.3327 10.8333 18.3327H9.16667C6.02397 18.3327 4.45262 18.3327 3.47631 17.3564C2.5 16.3801 2.5 14.8087 2.5 11.666V8.33268Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
    </svg>
  );
};
