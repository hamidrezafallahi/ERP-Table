import type { IIconConfig } from '../type';

export const Wallet = ({ config }: { config?: IIconConfig }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={config?.width ? `${config.width}` : "20"}
      height={config?.height ? `${config.height}` : "20"}
      viewBox="0 0 20 20"
      fill={config?.fill ? `${config.fill}` : "none"}
    >
      <path
        d="M5 6.66669H8.33333"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.3611 7.5H15.1923C13.7054 7.5 12.5 8.61929 12.5 10C12.5 11.3807 13.7054 12.5 15.1923 12.5H17.3611C17.4306 12.5 17.4653 12.5 17.4946 12.4982C17.944 12.4709 18.302 12.1385 18.3314 11.7212C18.3333 11.6939 18.3333 11.6617 18.3333 11.5972V8.40278C18.3333 8.33829 18.3333 8.30605 18.3314 8.27883C18.302 7.86153 17.944 7.52914 17.4946 7.50178C17.4653 7.5 17.4306 7.5 17.3611 7.5Z"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        opacity="0.64"
        d="M17.4709 7.49998C17.4061 5.93973 17.1972 4.9831 16.5238 4.30962C15.5475 3.33331 13.9761 3.33331 10.8334 3.33331L8.33341 3.33331C5.19072 3.33331 3.61937 3.33331 2.64306 4.30962C1.66675 5.28593 1.66675 6.85728 1.66675 9.99998C1.66675 13.1427 1.66675 14.714 2.64306 15.6903C3.61937 16.6666 5.19072 16.6666 8.33341 16.6666H10.8334C13.9761 16.6666 15.5475 16.6666 16.5238 15.6903C17.1972 15.0169 17.4061 14.0602 17.4709 12.5"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
      />
      <path
        opacity="0.5"
        d="M14.9925 10H15"
        className={
          !config?.stroke ? "stroke-gray-gray10  dark:stroke-gray-gray1" : ""
        }
        stroke={config?.stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
