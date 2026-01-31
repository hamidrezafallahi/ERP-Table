import type { IIconConfig } from '../type';

export const CardReceived = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M15.8334 11.6667V16.6667M15.8334 16.6667L17.5001 15M15.8334 16.6667L14.1667 15"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.3334 9.99998C18.3334 6.85728 18.3334 5.28593 17.3571 4.30962C16.3808 3.33331 14.8094 3.33331 11.6667 3.33331H8.33342C5.19072 3.33331 3.61937 3.33331 2.64306 4.30962C1.66675 5.28593 1.66675 6.85728 1.66675 9.99998C1.66675 13.1427 1.66675 14.714 2.64306 15.6903C3.61937 16.6666 5.19072 16.6666 8.33341 16.6666H11.6667"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        opacity="0.4"
        d="M8.33333 13.3333H5"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        opacity="0.4"
        d="M10.8334 13.3333H10.4167"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
      <path
        opacity="0.4"
        d="M1.66675 8.33331L18.3334 8.33331"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
      />
    </svg>
  );
};
